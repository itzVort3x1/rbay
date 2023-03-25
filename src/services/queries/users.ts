import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usersKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {};

export const getUserById = async (id: string) => {};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();
	// usersKey(id) is the key in the redis
	// the second argument object is the key value pairs that are stored in the usersKey(id) key.
	await client.hSet(usersKey(id), {
		username: attrs.username,
		password: attrs.password
	});

	return id;
};
