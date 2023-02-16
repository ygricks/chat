CREATE TABLE rooms (
	id bigserial PRIMARY KEY,
	title VARCHAR(50) NOT NULL
);

CREATE TABLE mess (
	id bigserial PRIMARY KEY,
	room_id bigint NOT NULL,
	author VARCHAR(50) NOT NULL,
	mess VARCHAR(500),
	CONSTRAINT fk_mess_room FOREIGN KEY(room_id) REFERENCES rooms(id)
);

INSERT INTO rooms(title) VALUES
('first chat room');

INSERT INTO mess(room_id, author, mess) VALUES
(1, 'igor', 'hai macar sa lucreze'),
(1, 'iura', 'un chat poti sal disvolti pina la infinit'),
(1, 'iura', 'si pin poti sa faci'),
(1, 'iura', 'si forward'),
(1, 'igor', 'macar sa lucreze');
