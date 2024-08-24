import jwt from 'jsonwebtoken';

export const authForMeals = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'noAccess' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    if (decoded.isAdmin) {
      return res.status(401).json({ msg: 'isAdmin' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ msg: 'Invalid token.' });
  }
};
export const authForOrders = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'noAccess' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    console.log(decoded);
    if (!decoded.isAdmin) {
      return res.status(401).json({ msg: 'isCustomer' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ msg: 'Invalid token.' });
  }
};

// export  const authForOrders = async(req, res, next) => {
//   if(req.user)
// }
