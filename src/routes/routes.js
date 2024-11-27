"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = void 0;
const User_1 = require("../model/User");
const Mobile_1 = require("../model/Mobile");
const CartItem_1 = require("../model/CartItem");
const Review_1 = require("../model/Review");
const configureRoutes = (passport, router) => {
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', (error, user) => {
            if (error) {
                res.status(500).send(error);
            }
            else {
                if (!user) {
                    res.status(400).send('User not found.');
                }
                else {
                    req.login(user, (err) => {
                        if (err) {
                            res.status(500).send('Internal server error.');
                        }
                        else {
                            res.status(200).send(user);
                        }
                    });
                }
            }
        })(req, res, next);
    });
    router.post('/register', (req, res) => {
        const username = req.body.username;
        const email = req.body.email;
        const name = req.body.name;
        const address = req.body.address;
        const password = req.body.password;
        const admin = false;
        const user = new User_1.User({ username: username, email: email, name: name, address: address, password: password, admin: admin });
        user.save().then(data => {
            res.status(201).send(data);
        }).catch(error => {
            res.status(500).send(error);
        });
    });
    router.post('/logout', (req, res) => {
        if (req.isAuthenticated()) {
            req.logout((error) => {
                if (error) {
                    res.status(500).send('Internal server error.');
                }
                res.status(200).send('Successfully logged out.');
            });
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.get('/isLoggedIn', (req, res) => {
        if (req.isAuthenticated()) {
            res.status(200).send(true);
        }
        else {
            res.status(200).send(false);
        }
    });
    router.get('/isAdmin', (req, res) => {
        if (req.isAuthenticated()) {
            const isAdmin = req.user.admin;
            res.status(200).send(isAdmin);
        }
        else {
            res.status(200).send(false);
        }
    });
    router.get('/getUser', (req, res) => {
        if (req.isAuthenticated()) {
            if (req.user) {
                const email = req.user.email;
                User_1.User.findOne({ email: email }).then(user => {
                    res.status(200).send(user);
                }).catch(error => {
                    res.status(400).send('User not found.');
                });
            }
            else {
                res.status(401).send('Missing user data.');
            }
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.post('/updateUser', (req, res) => {
        if (req.isAuthenticated()) {
            const email = req.user.email;
            const updatedUser = {};
            if (req.body.username) {
                updatedUser.username = req.body.username;
            }
            if ((req.body.name !== undefined) && (req.body.name !== null)) {
                updatedUser.name = req.body.name;
            }
            if ((req.body.address !== undefined) && (req.body.address !== null)) {
                updatedUser.address = req.body.address;
            }
            const query = User_1.User.updateOne({ 'email': email }, { $set: updatedUser });
            query.then(user => {
                res.status(200).send(user);
            }).catch(error => {
                res.status(400).send('User not found.');
            });
        }
        else {
            res.status(500).send('Internal server error.');
        }
    });
    router.delete('/deleteUser', (req, res) => {
        if (req.isAuthenticated()) {
            const email = req.user.email;
            User_1.User.deleteOne({ email: email }).then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send('Internal server error.');
            });
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.post('/uploadMobile', (req, res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                const name = req.body.name;
                const modelName = req.body.modelName;
                const company = req.body.company;
                const picture = req.body.picture;
                const price = req.body.price;
                const stock = req.body.stock;
                Mobile_1.Mobile.updateOne({ modelName: modelName }, { name: name, modelName: modelName, company: company, picture: picture, price: price, stock: stock }, { upsert: true }).then(data => {
                    if (data.upsertedCount === 1) {
                        res.status(201).send(data);
                    }
                    else {
                        res.status(200).send(data);
                    }
                }).catch(error => {
                    res.status(500).send(error);
                });
            }
            else {
                res.status(401).send('User has no admin privileges.');
            }
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.get('/getAllMobiles/:search?', (req, res) => {
        const search = req.params?.search;
        const filter = {};
        if (search !== undefined) {
            filter.name = new RegExp(search.replaceAll(' ', '.*'), 'i');
        }
        Mobile_1.Mobile.find(filter).then(mobile => {
            res.status(200).send(mobile);
        }).catch(error => {
            res.status(500).send('Internal server error.');
        });
    });
    router.get('/getMobile/:modelName', (req, res) => {
        const modelName = req.params?.modelName;
        let query = Mobile_1.Mobile.findOne({ modelName: modelName });
        query.then(mobile => {
            res.status(200).send(mobile);
        }).catch(error => {
            res.status(500).send('Internal server error.');
        });
    });
    router.delete('/deleteMobile/:modelName', (req, res) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) {
                const modelName = req.params.modelName;
                CartItem_1.CartItem.deleteMany({ modelName: modelName }).then(data => {
                    console.log('Delete success.');
                }).catch(error => {
                    console.log(error);
                });
                Mobile_1.Mobile.deleteOne({ modelName: modelName }).then(data => {
                    if (data.deletedCount !== 0) {
                        res.status(200).send(data);
                    }
                    else {
                        res.status(404).send('Mobile is not found.');
                    }
                }).catch(error => {
                    res.status(500).send('Internal server error.');
                });
            }
            else {
                res.status(401).send('User has no admin privileges.');
            }
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.get('/getCart', (req, res) => {
        if (req.isAuthenticated()) {
            if (req.user) {
                const email = req.user['email'];
                CartItem_1.CartItem.aggregate([
                    { $match: { userEmail: email } },
                    { $lookup: { from: Mobile_1.Mobile.collection.collectionName, localField: 'modelName', foreignField: 'modelName', as: 'mobile' } }
                ]).then((data) => {
                    res.status(200).send(data);
                }).catch(error => {
                    res.status(500).send('Internal server error.');
                });
            }
            else {
                res.status(401).send('Missing user data.');
            }
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.post('/addToCart', (req, res) => {
        if (req.isAuthenticated()) {
            console.log('User is logged in.');
            if (req.user) {
                const userEmail = req.user['email'];
                const modelName = req.body.modelName;
                const quantity = parseInt(req.body.quantity);
                const mobileQuery = Mobile_1.Mobile.findOne({ modelName: modelName });
                mobileQuery.then(mobile => {
                    if (mobile !== null) {
                        console.log('Found mobile!');
                        const stock = mobile.get('stock');
                        const newStock = stock - quantity;
                        if (stock >= quantity) {
                            console.log('On Stock!');
                            const query = CartItem_1.CartItem.findOne({ userEmail: userEmail, modelName: modelName });
                            query.then(cartItem => {
                                if (cartItem !== null) {
                                    console.log('Cart item already exists!');
                                    const currentQuantity = cartItem.get('quantity');
                                    const cartQuantity = currentQuantity + quantity;
                                    CartItem_1.CartItem.updateOne({ userEmail: userEmail, modelName: modelName }, { quantity: cartQuantity }).then(data => {
                                        console.log('Added to cart');
                                    }).catch(error => {
                                        console.log(error);
                                    });
                                    Mobile_1.Mobile.updateOne({ modelName: modelName }, { stock: newStock }).then(data => {
                                        console.log('Removed from mobile stock');
                                    }).catch(error => {
                                        console.log(error);
                                    });
                                }
                                else {
                                    console.log('Cart item doesnt exist');
                                    const cartItem = new CartItem_1.CartItem({ userEmail: userEmail, modelName: modelName, quantity: quantity });
                                    cartItem.save().then(data => {
                                        console.log('Added to cart');
                                        res.status(200).send(data);
                                    }).catch(error => {
                                        console.log(error);
                                        res.status(500).send(error);
                                    });
                                    Mobile_1.Mobile.updateOne({ modelName: modelName }, { stock: newStock }).then(data => {
                                        console.log('Removed from mobile stock');
                                    }).catch(error => {
                                        console.log(error);
                                    });
                                }
                                res.status(200);
                            }).catch(error => {
                                res.status(500).send('Internal server error.');
                            });
                        }
                        else {
                            res.status(500).send('Not enough items in stock.');
                        }
                    }
                    else {
                        res.status(500).send('Mobile not found.');
                    }
                }).catch(error => {
                    res.status(500).send('Internal server error.');
                });
            }
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.post('/removeFromCart', (req, res) => {
        if (req.isAuthenticated()) {
            console.log('User is logged in.');
            const userEmail = req.user.email;
            const modelName = req.body.modelName;
            const quantity = parseInt(req.body.quantity);
            const mobileQuery = Mobile_1.Mobile.findOne({ modelName: modelName });
            mobileQuery.then(mobile => {
                if (mobile !== null) {
                    console.log('Found mobile!');
                    const stock = mobile.get('stock');
                    const newStock = stock + quantity;
                    const query = CartItem_1.CartItem.findOne({ userEmail: userEmail, modelName: modelName });
                    query.then(cartItem => {
                        if (cartItem !== null) {
                            console.log('Cart item found!');
                            const currentQuantity = cartItem.get('quantity');
                            const cartQuantity = currentQuantity - quantity;
                            if (cartQuantity <= 0) {
                                CartItem_1.CartItem.deleteOne({ userEmail: userEmail, modelName: modelName }).then(data => {
                                    console.log('Removed cart item');
                                }).catch(error => {
                                    console.log(error);
                                });
                                Mobile_1.Mobile.updateOne({ modelName: modelName }, { stock: newStock }).then(data => {
                                    console.log('Added to mobile stock');
                                }).catch(error => {
                                    console.log(error);
                                });
                            }
                            else {
                                CartItem_1.CartItem.updateOne({ userEmail: userEmail, modelName: modelName }, { quantity: cartQuantity }).then(data => {
                                    console.log('Removed from cart');
                                }).catch(error => {
                                    console.log(error);
                                });
                                Mobile_1.Mobile.updateOne({ modelName: modelName }, { stock: newStock }).then(data => {
                                    console.log('Added to mobile stock');
                                }).catch(error => {
                                    console.log(error);
                                });
                            }
                            res.status(200);
                        }
                        else {
                            console.log('Cart item doesnt exist!');
                            res.status(500).send('Cart item doesnt exist.');
                        }
                    }).catch(error => {
                        res.status(500).send('Internal server error.');
                    });
                }
                else {
                    res.status(500).send('Mobile not found.');
                }
            }).catch(error => {
                res.status(500).send('Internal server error.');
            });
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.post('/purchase', (req, res) => {
        if (req.isAuthenticated()) {
            const email = req.user.email;
            CartItem_1.CartItem.deleteMany({ userEmail: email }).then(data => {
                res.status(200).send(data);
            }).catch(error => {
                res.status(500).send('Internal server error.');
            });
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.get('/getReviews/:modelName', (req, res) => {
        const modelName = req.params.modelName;
        Review_1.Review.aggregate([
            { $match: { modelName: modelName } },
            { $lookup: { from: User_1.User.collection.collectionName, localField: 'userEmail', foreignField: 'email', as: 'user' } }
        ]).then((data) => {
            res.status(200).send(data);
        }).catch(error => {
            res.status(500).send('Internal server error.');
        });
    });
    router.post('/addReview', (req, res) => {
        if (req.isAuthenticated()) {
            if (req.user) {
                const userEmail = req.user['email'];
                const modelName = req.body.modelName;
                const score = parseInt(req.body.score);
                const text = req.body.text;
                Review_1.Review.updateOne({ userEmail: userEmail, modelName: modelName }, { userEmail: userEmail, modelName: modelName, score: score, text: text }, { upsert: true }).then((data) => {
                    if (data.upsertedCount === 1) {
                        res.status(201).send(data);
                    }
                    else {
                        res.status(200).send(data);
                    }
                }).catch((error) => {
                    res.status(500).send('Internal server error.');
                });
            }
            else {
            }
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.delete('/deleteReview', (req, res) => {
        if (req.isAuthenticated()) {
            const userEmail = req.user.email;
            const modelName = req.body.modelName;
            Review_1.Review.deleteOne({ userEmail: userEmail, modelName: modelName }).then((data) => {
                res.status(200).send(data);
            }).catch((error) => {
                res.status(500).send('Internal server error.');
            });
        }
        else {
            res.status(401).send('User is not logged in.');
        }
    });
    router.post('/initUsers', (req, res) => {
        User_1.User.bulkSave([
            new User_1.User({
                username: 'admin',
                email: 'admin@mobilwebshop.com',
                name: 'Adminisztátor',
                address: '',
                password: 'admin',
                admin: true
            }),
            new User_1.User({
                username: 'ivan',
                email: 'ivan@test.com',
                name: 'Bohár Iván',
                address: '6722 Szeged, Dugonics tér 3',
                password: 'password',
                admin: false
            })
        ]).then((data) => {
            res.status(201).send(data);
        }).catch((error) => {
            res.status(500).send('Internal server error.');
        });
    });
    router.post('/initMobiles', (req, res) => {
        Mobile_1.Mobile.bulkSave([
            new Mobile_1.Mobile({
                name: 'iPhone 11',
                modelName: 'A2111',
                company: 'Apple',
                picture: 'apple-iphone-11.jpg',
                price: 169990,
                stock: 11
            }),
            new Mobile_1.Mobile({
                name: 'P30',
                modelName: 'ELE-L29',
                company: 'Huawei',
                picture: 'huawei-p30.jpg',
                price: 81990,
                stock: 3
            }),
            new Mobile_1.Mobile({
                name: 'Redmi Note 11 Pro',
                modelName: '2201116TG',
                company: 'Xiaomi',
                picture: 'xiaomi-redmi-note-11-pro.png',
                price: 53990,
                stock: 5
            }),
            new Mobile_1.Mobile({
                name: 'Samsung Galaxy A50',
                modelName: 'SM-A505U1',
                company: 'Samsung',
                picture: 'samsung-galaxy-a50.jpg',
                price: 33990,
                stock: 2
            })
        ]).then((data) => {
            res.status(201).send(data);
        }).catch((error) => {
            res.status(500).send('Internal server error.');
        });
    });
    router.post('/initReviews', (req, res) => {
        Review_1.Review.bulkSave([
            new Review_1.Review({
                userEmail: 'ivan@test.com',
                modelName: 'SM-A505U1',
                score: 4,
                text: 'Jó belépő kategóriás telefon, csak ajánlani tudom.',
            }),
            new Review_1.Review({
                userEmail: 'ivan@test.com',
                modelName: 'ELE-L29',
                score: 2,
                text: 'Egy év után nagyon belassult, ezért le kellett cserélnem.'
            })
        ]).then((data) => {
            res.status(201).send(data);
        }).catch((error) => {
            res.status(500).send('Internal server error.');
        });
    });
    return router;
};
exports.configureRoutes = configureRoutes;
