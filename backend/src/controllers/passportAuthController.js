export const googleCallback = (req, res) => {
  try {
    const user = req.user || {};
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || user.photos?.[0]?.value || user._json?.picture || null
    };

    const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

    // Return an HTML page that posts the payload to the opener window and then closes.
    // Use '*' target for postMessage in dev to avoid dropped messages when frontend port differs.
    // In production set FRONTEND_ORIGIN to a specific origin and consider tightening this.
    return res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Authentication Successful</title>
          <style>body{font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}</style>
        </head>
        <body>
          <div>
            <h2>Login successful</h2>
            <p>You can close this window; the application will continue.</p>
            <button id="closeBtn">Close</button>
          </div>
          <script>
            (function(){
              try {
                const payload = ${JSON.stringify(payload)};
                const target = '*';
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ type: 'oauth', user: payload }, target);
                }
              } catch (e) {
                console.error(e);
              }
              // allow the user to close, and auto-close after short delay
              document.getElementById('closeBtn').addEventListener('click', function(){ window.close(); });
              setTimeout(function(){ try{ window.close(); }catch(e){} }, 2000);
            })();
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/api');
  });
};
