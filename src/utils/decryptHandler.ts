import bcrypt from 'bcryptjs';

async function decryptHandler(data: { stringToCompare: string; hashedString: string }) {
  const { stringToCompare, hashedString } = data;

  const isMatch = await bcrypt.compare(stringToCompare, hashedString);
  // console.log(isMatch);
  return isMatch;
}

export default decryptHandler;
