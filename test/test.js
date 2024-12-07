import { initUsers, initMobiles, initReviews } from '../src/init';
import {User} from "../src/model/User";
import mongoose from "mongoose";
import {Review} from "../src/model/Review";
import {Mobile} from "../src/model/Mobile";
import {CartItem} from "../src/model/CartItem";

beforeAll(async () => {
    const dbHost = process.env.MONGODB_HOST || 'localhost';
    const dbPort = process.env.MONGODB_PORT || '27017';
    const db = process.env.MONGODB_DB || 'my_db';
    const dbUrl = `mongodb://${dbHost}:${dbPort}/${db}`;
    await mongoose.connect(dbUrl).then((_) => {

    }).catch((error) => {
        throw new Error('Failed to connect to MongoDB');
    });
});

describe('Initializing the database', () => {
    test('Clean the database', async () => {
        await User.deleteMany({}).then((result) => {

        }).catch((error) => {
            throw new Error('Failed to delete users');
        });

        await Mobile.deleteMany({}).then((result) => {

        }).catch((error) => {
            throw new Error('Failed to delete mobiles');
        });

        await Review.deleteMany({}).then((result) => {

        }).catch((error) => {
            throw new Error('Failed to delete reviews');
        });

        await CartItem.deleteMany({}).then((result) => {

        }).catch((error) => {
            throw new Error('Failed to delete cart items');
        });
    });

    test('Should initialize the database', async () => {
        await initUsers().then((data) => {

        }).catch((err) => {
            throw new Error('User initialization failed');
        });

        await initMobiles().then((data) => {

        }).catch((err) => {
            throw new Error('Mobile initialization failed');
        });

        await initReviews().then((data) => {

        }).catch((err) => {
            throw new Error('Review initialization failed');
        });

        await CartItem.bulkSave([
            new CartItem({
                userEmail: 'ivan@test.com',
                modelName: 'SM-A505U1',
                quantity: 1
            }),
            new CartItem({
                userEmail: 'ivan@test.com',
                modelName: 'ELE-L29',
                quantity: 2
            })
        ]).then((data) => {

        }).catch((err) => {
            throw new Error('Cart initialization failed');
        });
    });

    test('Get user', async () => {
        await User.findOne({email: 'ivan@test.com'}).then(user => {
            expect(user.username).toEqual('ivan');
            expect(user.email).toEqual('ivan@test.com');
            expect(user.name).toEqual('Bohár Iván');
            expect(user.address).toEqual('6722 Szeged, Dugonics tér 3');
            user.comparePassword('password', (error, isMatch) => {
                expect(error).toBeNull();
            });
            expect(user.admin).toEqual(false);
        }).catch(error => {
            throw new Error('Failed to get user');
        });
    });

    test('Get mobile', async () => {
        let query = Mobile.findOne({modelName: 'SM-A505U1'});
        await query.then(mobile => {
            expect(mobile.name).toEqual('Samsung Galaxy A50');
            expect(mobile.modelName).toEqual('SM-A505U1');
            expect(mobile.company).toEqual('Samsung');
            expect(mobile.picture).toEqual('samsung-galaxy-a50.jpg');
            expect(mobile.price).toEqual(33990);
            expect(mobile.stock).toEqual(2);
        }).catch(error => {
            throw new Error('Failed to get mobile');
        });
    });

    test('Get review', async () => {
        await Review.aggregate([
            {$match: {modelName: 'SM-A505U1'}},
            {
                $lookup: {
                    from: User.collection.collectionName,
                    localField: 'userEmail',
                    foreignField: 'email',
                    as: 'user'
                }
            }
        ]).then((data) => {
            expect(data[0].userEmail).toEqual('ivan@test.com');
            expect(data[0].modelName).toEqual('SM-A505U1');
            expect(data[0].score).toEqual(4);
            expect(data[0].text).toEqual('Jó belépő kategóriás telefon, csak ajánlani tudom.');
        }).catch(error => {
            throw new Error('Failed to get review');
        });
    });

    test('Get cart item', async () => {
        let query = CartItem.findOne({userEmail: 'ivan@test.com', modelName: 'SM-A505U1'});
        await query.then(cartItem => {
            expect(cartItem.userEmail).toEqual('ivan@test.com');
            expect(cartItem.modelName).toEqual('SM-A505U1');
            expect(cartItem.quantity).toEqual(1);
        }).catch(error => {
            throw new Error('Failed to get cart item');
        });
    });
});

afterAll(async () => {
    await mongoose.disconnect().then(() => {

    }).catch((error) => {
        throw new Error('MongoDB failed to disconnect');
    });
});
