"""PDF utility functions used across routes.

Currently provides a simple helper to extract text content from a PDF
represented as raw bytes, using pypdf's PdfReader.
"""

from __future__ import annotations

import io
from typing import Optional

from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF given its raw bytes.

    Returns a single string with page texts joined by newlines. If any
    error occurs during parsing, it logs and returns an empty string
    rather than raising, so callers can handle the "no text" case
    uniformly.
    """
    if not isinstance(file_bytes, (bytes, bytearray)):
        raise TypeError("file_bytes must be bytes or bytearray")

    try:
        pdf_stream = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_stream)
        text_chunks: list[str] = []

        for page in reader.pages:
            try:
                text: Optional[str] = page.extract_text()
            except Exception as page_err:  # pragma: no cover - defensive
                print(f"[PDF UTILS] Page extract error: {page_err}")
                text = None

            if text:
                text_chunks.append(text)

        return "\n".join(text_chunks)
    except Exception as e:  # pragma: no cover - defensive
        print(f"[PDF UTILS] Read error: {e}")
        return ""
