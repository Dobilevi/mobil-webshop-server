import {User} from "./model/User";
import {Mobile} from "./model/Mobile";
import {Review} from "./model/Review";

export function initUsers() {
    return User.bulkSave([
        new User({
            username: 'admin',
            email: 'admin@mobilwebshop.com',
            name: 'Adminisztátor',
            address: '',
            password: 'admin',
            admin: true
        }),
        new User({
            username: 'ivan',
            email: 'ivan@test.com',
            name: 'Bohár Iván',
            address: '6722 Szeged, Dugonics tér 3',
            password: 'password',
            admin: false
        })
    ]);
}

export function initMobiles() {
    return Mobile.bulkSave([
        new Mobile({
            name: 'iPhone 11',
            modelName: 'A2111',
            company: 'Apple',
            picture: 'apple-iphone-11.jpg',
            price: 169990,
            stock: 11
        }),
        new Mobile({
            name: 'P30',
            modelName: 'ELE-L29',
            company: 'Huawei',
            picture: 'huawei-p30.jpg',
            price: 81990,
            stock: 3
        }),
        new Mobile({
            name: 'Redmi Note 11 Pro',
            modelName: '2201116TG',
            company: 'Xiaomi',
            picture: 'xiaomi-redmi-note-11-pro.png',
            price: 53990,
            stock: 5
        }),
        new Mobile({
            name: 'Samsung Galaxy A50',
            modelName: 'SM-A505U1',
            company: 'Samsung',
            picture: 'samsung-galaxy-a50.jpg',
            price: 33990,
            stock: 2
        })
    ]);
}

export function initReviews() {
    return Review.bulkSave([
        new Review({
            userEmail: 'ivan@test.com',
            modelName: 'SM-A505U1',
            score: 4,
            text: 'Jó belépő kategóriás telefon, csak ajánlani tudom.',
        }),
        new Review({
            userEmail: 'ivan@test.com',
            modelName: 'ELE-L29',
            score: 2,
            text: 'Egy év után nagyon belassult, ezért le kellett cserélnem.'
        })
    ]);
}


