/**
 * Input sanitization middleware
 */

export const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs to prevent XSS
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .trim()
      .substring(0, 1000); // Max length 1000 chars
  };

  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }

  next();
};

export const validateClientSeed = (req, res, next) => {
  const { clientSeed } = req.body;
  
  if (clientSeed) {
    // Client seed validation
    if (typeof clientSeed !== 'string') {
      return res.status(400).json({ error: 'Client seed must be a string' });
    }
    
    if (clientSeed.length < 1 || clientSeed.length > 64) {
      return res.status(400).json({ error: 'Client seed must be 1-64 characters' });
    }
    
    // Only allow alphanumeric and basic special chars
    if (!/^[a-zA-Z0-9_-]+$/.test(clientSeed)) {
      return res.status(400).json({ error: 'Client seed contains invalid characters' });
    }
  }
  
  next();
};
