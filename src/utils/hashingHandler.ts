import bcrypt from 'bcryptjs';

async function hashingHandler(data: { stringToHash: string }) {
  const { stringToHash } = data;

  const salt = await bcrypt.genSalt(14);
  const hashedString = await bcrypt.hash(stringToHash, salt);
  return hashedString;
}

export default hashingHandler;
