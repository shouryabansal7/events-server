const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helpers/date");
const DataLoader = require("dataloader");

const eventLoader = new DataLoader((eventIds) => {
  return events(eventIds);
});

const userLoader = new DataLoader((userIds) => {
  return User.find({ _id: { $in: userIds } });
});

const singleEvent = async (eventId) => {
  try {
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch (err) {
    throw err;
  }
};

const events = async (eventIds) => {
  try {
    let events = await Event.find({ _id: { $in: eventIds } });
    events.sort((a, b) => {
      return (
        eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
      );
    });
    events = await events.map((event) => {
      return transformEvent(event);
    });
    return events;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

//manual user population method
const user = async (userId) => {
  try {
    const U = await userLoader.load(userId.toString());
    return {
      ...U._doc,
      _id: U.id,
      createdEvents: () => eventLoader.loadMany(user._doc.createdEvents),
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const transformEvent = (event) => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator),
  };
};

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
  };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

// exports.user = user;
// exports.events = events;
// exports.singleEvent = singleEvent;
