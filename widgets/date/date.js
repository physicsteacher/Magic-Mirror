if (Meteor.isClient) {

Template.date.helpers({

  date: function() {
    return Chronos.liveMoment().format("dddd, MMMM Do");
  }
});
}
