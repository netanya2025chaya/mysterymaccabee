// =====================
// Secret Santa Server
// =====================

const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// ---------------------
// Names list (locked)
// ---------------------
const names = [
  "bubby",
  "zayde",
  "abba",
  "mommy",
  "sroch",
  "llama",
  "uncle micah"
];

// ---------------------
// Generate 2 random pair sets
// ---------------------
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function createPairSet() {
  let givers = shuffle(names);
  let receivers = shuffle(names);

  // ensure no one is paired with themselves
  for (let i = 0; i < givers.length; i++) {
    if (givers[i] === receivers[i]) {
      let swapIndex = (i + 1) % givers.length;
      [receivers[i], receivers[swapIndex]] = [receivers[swapIndex], receivers[i]];
    }
  }

  return givers.map((giver, i) => ({
    giver,
    receiver: receivers[i],
    claimed: false
  }));
}

// ---------------------
// Two pair sets total
// ---------------------
let assignments = {};
names.forEach(n => (assignments[n] = []));

let set1 = createPairSet();
let set2 = createPairSet();

set1.forEach(p => assignments[p.giver].push(p));
set2.forEach(p => assignments[p.giver].push(p));


// ======================
//  API
// ======================

// Get assignment for a user
app.post("/claim", (req, res) => {
  const user = req.body.name.toLowerCase();

  if (!assignments[user]) {
    return res.json({ error: "Name not found." });
  }

  // find unclaimed assignment
  let found = assignments[user].find(p => !p.claimed);

  // if none, return last claimed one
  if (!found) {
    return res.json({ receiver: assignments[user][1].receiver, alreadyClaimed: true });
  }

  // mark as claimed
  found.claimed = true;
  return res.json({ receiver: found.receiver, alreadyClaimed: false });
});


// Web server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Secret Santa server running on port " + PORT);
});