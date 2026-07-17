import api from "./axios";

export const meetingAttendeesAPI = {
  getAttendees: (meetingId) => api.get(`/meeting-attendees/${meetingId}/attendees`),
  addAttendees: (meetingId, userIds) =>
    api.post(`/meeting-attendees/${meetingId}/attendees`, { users: userIds }),
};