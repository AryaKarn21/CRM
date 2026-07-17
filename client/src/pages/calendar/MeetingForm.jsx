import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

import { meetingsAPI } from "@/api/meetings.api";
import { meetingAttendeesAPI } from "@/api/meetingAttendees.api";

import BasicInformation from "./components/MeetingForm/BasicInformation";
import ScheduleSection from "./components/MeetingForm/ScheduleSection";
import AttendeesSection from "./components/MeetingForm/AttendeesSection";
import ReminderSection from "./components/MeetingForm/ReminderSection";

export default function MeetingForm({
  meeting,
  isEditing = false,
  selectedDate,
  onClose,
  onSuccess,
}) {
  const [attendeeIds, setAttendeeIds] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      meetingType: "online",
      meetingLink: "",
      location: "",
      startTime: selectedDate ? `${selectedDate}T09:00` : "",
      endTime: selectedDate ? `${selectedDate}T10:00` : "",
      priority: "medium",
      reminderMinutes: 30,
    },
  });

  // Convert Date -> datetime-local string
  const formatDateTimeLocal = (date) => {
    if (!date) return "";

    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());

    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (isEditing && meeting) {
      reset({
        title: meeting.title || "",
        description: meeting.extendedProps?.description || "",
        meetingType: meeting.extendedProps?.meetingType || "online",
        meetingLink: meeting.extendedProps?.meetingLink || "",
        location: meeting.extendedProps?.location || "",
        startTime: formatDateTimeLocal(meeting.start),
        endTime: formatDateTimeLocal(meeting.end),
        priority: meeting.extendedProps?.priority || "medium",
        reminderMinutes:
          meeting.extendedProps?.reminderMinutes ?? 30,
      });
    } else {
      reset({
        title: "",
        description: "",
        meetingType: "online",
        meetingLink: "",
        location: "",
        startTime: selectedDate ? `${selectedDate}T09:00` : "",
        endTime: selectedDate ? `${selectedDate}T10:00` : "",
        priority: "medium",
        reminderMinutes: 30,
      });

      setAttendeeIds([]);
    }
  }, [meeting, isEditing, selectedDate, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        attendeeIds,
      };

      if (isEditing) {
        await meetingsAPI.updateMeeting(meeting.id, payload);

        toast.success("Meeting updated successfully");
      } else {
        const res = await meetingsAPI.createMeeting(payload);

        if (attendeeIds.length > 0) {
          await meetingAttendeesAPI.addAttendees(
            res.data.data.id,
            attendeeIds
          );
        }

        toast.success("Meeting created successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          `Failed to ${
            isEditing ? "update" : "create"
          } meeting`
      );
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? "Edit Meeting" : "Schedule New Meeting"}
      size="xl"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="meeting-form"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Saving...
              </span>
            ) : isEditing ? (
              "Update Meeting"
            ) : (
              "Create Meeting"
            )}
          </button>
        </>
      }
    >
      <form id="meeting-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <BasicInformation
              register={register}
              errors={errors}
              watch={watch}
            />

            <ScheduleSection
              register={register}
              errors={errors}
            />
          </div>

          <div className="space-y-8">
            <AttendeesSection
              selectedIds={attendeeIds}
              onChange={setAttendeeIds}
            />

            <ReminderSection
              register={register}
              watch={watch}
              setValue={setValue}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}