

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    os: {type: String, default: 'unknown', enum: ['android', 'iOS', 'windows', 'OSX', 'unknown']},
    hardware: {type: String, default: 'unknown'},
    reg_id: {type: String, default: null, unique: true},
    receive_notifications: {type: Boolean, default: true}
});

var UserSchema = new Schema({
    first_name: {type: String, trim: true, default: null},
    last_name: {type: String, trim: true, default: null},
    birthday: {type: Date, default: null},
    gender: {type: String, default: 'unknown', enum: ['male', 'female', 'unknown']},
    email: {type: String, trim: true, default: null},
    password: {type: String, default: ''},
    web: {type: String, default: ''},
    about: {type: String, default: ''},
    image: {type: String, default: ''},
    from: {type: String, default: ''}, // location of the user
    reg_id: {type: String, default: ''}, // android, iphone reg id for push notification
    session_id: {type: String, default: ''},
    fb_userid: {type: String, default: ''},
    auth_token: {type: String, default: ''},
    created_at: {type: Number, default: new Date().getTime()},
    modified_at: {type: Number, default: new Date().getTime()},
    active: {type: Boolean, default: true},
    synced_at: {type: Date, default: null},
    devices: [DeviceSchema]
});

mongoose.model('User', UserSchema);