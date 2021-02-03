const User = require('../models/User');
const Session = require('../models/Session');

User.hasOne(Session);