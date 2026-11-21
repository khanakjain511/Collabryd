-- PostgreSQL delivers NOTIFY only after the inserting transaction commits.
CREATE FUNCTION collabryd.announce_notification() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_notify('collabryd_notifications', NEW.notification_id::text);
    RETURN NEW;
END;
$$;

CREATE TRIGGER announce_notification AFTER INSERT ON collabryd.notifications
FOR EACH ROW EXECUTE FUNCTION collabryd.announce_notification();
