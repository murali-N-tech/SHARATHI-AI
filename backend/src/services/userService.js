import User from "../models/userModel.js";

/**
 * Find an existing user by Google providerId or email, or create one.
 * Returns the user document.
 */
export async function findOrCreateGoogleUser(profile) {
  const providerId = profile.id;
  const email = profile.emails?.[0]?.value?.toLowerCase();
  const name = profile.displayName || profile.username;
  const avatar = profile.photos?.[0]?.value || profile._json?.picture;
  const emailVerified = !!profile._json?.email_verified || false;

  // try finding by provider id first
  let user = await User.findOne({ 'providers.provider': 'google', 'providers.providerId': providerId });

  // fallback to email match
  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (!user) {
    // create new user
    user = await User.create({
      name,
      email,
      avatar,
      providers: [{ provider: 'google', providerId }],
      emailVerified,
      lastLogin: new Date()
    });
  } else {
    // ensure provider linked
    const hasProvider = (user.providers || []).some(p => p.provider === 'google' && p.providerId === providerId);
    if (!hasProvider) {
      user.providers.push({ provider: 'google', providerId });
    }
    user.lastLogin = new Date();
    if (avatar) user.avatar = avatar;
    if (emailVerified) user.emailVerified = true;
    await user.save();
  }

  return user;
}

export async function getUserById(id) {
  return User.findById(id);
}
