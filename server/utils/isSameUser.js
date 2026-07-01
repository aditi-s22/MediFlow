// Compares a Mongoose ObjectId field against the logged-in user's id.
// Both sides are converted to strings since ObjectId comparison with === doesn't work directly.
const isSameUser = (objectId, userId) => objectId.toString() === userId.toString();

export default isSameUser;
