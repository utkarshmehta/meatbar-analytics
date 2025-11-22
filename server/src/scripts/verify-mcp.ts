import { addConsumption, getAllUsers } from '../services/analytics.service';

async function verify() {
    console.log('Verifying MCP tools logic...');

    try {
        // Test 1: Add Consumption
        console.log('Testing addConsumption...');
        const person = `TestUser_${Date.now()}`;
        const result = await addConsumption(person, 'beef', new Date().toISOString());
        console.log('addConsumption result:', result);

        if (!result.id) {
            throw new Error('addConsumption failed to return an ID');
        }

        // Test 2: Get All Users
        console.log('Testing getAllUsers...');
        const users = await getAllUsers();
        console.log('getAllUsers result:', users);

        if (!users.includes(person)) {
            throw new Error(`getAllUsers did not include the new user: ${person}`);
        }

        console.log('Verification successful!');
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
