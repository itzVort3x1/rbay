import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usersKey, usernamesUniqueKey, usernamesKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
	// use the username argument to look up the persons User ID
	// with the username sorted set
	const decimalId = await client.zScore(usernamesKey(), username);
	// make sure we actually got an ID from the lookup
	if (!decimalId) {
		throw new Error('User does not exist');
	}
	//Take the id and convert it back to hex
	const id = decimalId.toString(16);

	// Use the id to look up the user's hash
	const user = await client.hGetAll(usersKey(id));

	// deserialize and return the hash
	return deserialize(id, user);
};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(usersKey(id));

	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();

	//see if the username is already in the set of usernames
	// if so, throw and error
	// otherwise, continue
	const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username);

	if (exists) {
		throw new Error('Username already exists');
	}

	// usersKey(id) is the key in the redis
	// the second argument object is the key value pairs that are stored in the usersKey(id) key.
	await client.hSet(usersKey(id), serialize(attrs));
	await client.sAdd(usernamesUniqueKey(), attrs.username);
	// parseInt(id, 16) converts it to base 16
	await client.zAdd(usernamesKey(), {
		value: attrs.username,
		score: parseInt(id, 16)
	});

	return id;
};

const serialize = (user: CreateUserAttrs) => {
	return {
		username: user.username,
		password: user.password
	};
};

const deserialize = (id: string, user: { [key: string]: string }) => {
	return {
		id: id,
		username: user.username,
		password: user.password
	};
};
