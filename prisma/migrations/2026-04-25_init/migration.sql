-- Init Skill Exchange DB (SQLite)
CREATE TABLE Thread (
  id TEXT PRIMARY KEY NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE Message (
  id TEXT PRIMARY KEY NOT NULL,
  threadId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (threadId) REFERENCES Thread(id)
);

CREATE TABLE Proposal (
  id TEXT PRIMARY KEY NOT NULL,
  threadId TEXT NOT NULL,
  mentorId TEXT NOT NULL,
  plan TEXT NOT NULL,
  price INTEGER,
  durationDays INTEGER,
  status TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (threadId) REFERENCES Thread(id)
);
