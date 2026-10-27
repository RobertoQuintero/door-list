-- Remove only the synthetic record created while verifying the repaired flow.
-- Its ticket is removed by the registrations -> tickets cascade.
delete from public.registrations
where event_id = '86ac345f-bb0a-4cf4-9a52-189015a4864b'
  and ticket_type_id = '6ac97602-0428-43a6-b690-6d056940192f'
  and attendee_name = 'Prueba automatizada'
  and attendee_email = 'delivered@resend.dev';
