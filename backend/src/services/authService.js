const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const register = async ({ name, email, password, role, erpId, accountNumber }) => {
  // Validate role
  const validRoles = ['STUDENT', 'STAKEHOLDER', 'ADMIN'];
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role. Must be STUDENT, STAKEHOLDER, or ADMIN');
  }

  // Students must provide ERP ID
  if (role === 'STUDENT' && !erpId) {
    throw new Error('ERP ID is required for students');
  }

  // Check duplicate email
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error('Email already registered');

  // Check duplicate ERP
  if (erpId) {
    const existingErp = await prisma.user.findUnique({ where: { erpId } });
    if (existingErp) throw new Error('ERP ID already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      erpId: role === 'STUDENT' ? erpId : null,
      accountNumber: role === 'STUDENT' ? accountNumber : null,
    },
    select: {
      id: true, name: true, email: true, role: true,
      erpId: true, walletBalance: true, createdAt: true,
    },
  });

  return user;
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      erpId: user.erpId,
      walletBalance: user.walletBalance,
    },
  };
};

module.exports = { register, login };
