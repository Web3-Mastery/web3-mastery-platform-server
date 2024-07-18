let preSignUpUser = {
  sessions: [
    { sessionId: 1, startTime: '1625256000000', lastCheckInTime: '1625266000000' },
    { sessionId: 2, startTime: '1625356000000', lastCheckInTime: '1625366000000' },
    { sessionId: 3, startTime: '1625456000000', lastCheckInTime: '1625466000000' }
  ]
};

if (preSignUpUser.sessions && preSignUpUser.sessions.length > 0) {
  const inMemorySessions = preSignUpUser.sessions;

  console.log(inMemorySessions);
  const currentSession = inMemorySessions[inMemorySessions.length - 1];

  console.log(currentSession);
  const currentTimeInMilliseconds = Date.now();

  const newCurrentUserSessionObject = {
    startTime: currentSession?.startTime,
    lastCheckInTime: currentTimeInMilliseconds.toString(),
    userDeviceData: []
  };

  console.log(newCurrentUserSessionObject);

  preSignUpUser.sessions[inMemorySessions.length - 1] = newCurrentUserSessionObject;

  const newSessionsArray = [...preSignUpUser.sessions];
  console.log(newSessionsArray);
  console.log(preSignUpUser.sessions[inMemorySessions.length - 1]);

  console.log(preSignUpUser.sessions);
}
