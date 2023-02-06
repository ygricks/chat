CREATE TABLE rooms (
	id bigserial PRIMARY KEY,
	title VARCHAR(50) NOT NULL
);

CREATE TABLE mess (
	id bigserial PRIMARY KEY,
	room_id bigint NOT NULL,
	author VARCHAR(50) NOT NULL,
	mess VARCHAR(500)
);

INSERT INTO rooms(id, title) VALUES
(1, 'first chat room');

INSERT INTO mess(id, room_id, author, mess) VALUES
(1, 1, 'igor', 'hai macar sa lucreze'),
(2, 1, 'iura', 'un chat poti sal disvolti pina la infinit'),
(3, 1, 'iura', 'si pin poti sa faci'),
(4, 1, 'iura', 'si forward'),
(5, 1, 'igor', 'macar sa lucreze');
