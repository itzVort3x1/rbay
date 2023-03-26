import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
	await client.hSet('car1', {
		name: 'Ferrari',
		color: 'red',
		year: 1950
	});

	await client.hSet('car2', {
		name: 'Ferrari',
		color: 'green',
		year: 1955
	});

	await client.hSet('car3', {
		name: 'Ferrari',
		color: 'blue',
		year: 1958
	});

	const commands = [1, 2, 3].map((id) => {
		return client.hGetAll('car' + id);
	});

	// this is called pipelining
	const results = await Promise.all(commands);

	console.log(results);
};
run();
