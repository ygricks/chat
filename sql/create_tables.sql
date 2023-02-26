-- --------------
-- commands
-- --------------

-- docker exec -it chat_postgres bash - login container with db
-- psql -U postgres - login postgres
-- \l - show databases
-- \c - connect to db
-- \dt - show tables

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOt NULL
);

CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hash VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expired_at TIMESTAMP DEFAULT now() + '10 day'::interval,
	CONSTRAINT fk_session_user FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE rooms (
	id BIGSERIAL PRIMARY KEY,
	title VARCHAR(50) NOT NULL,
	created_by BIGINT NOT NULL,
	CONSTRAINT fk_room_user FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE mess (
	id BIGSERIAL PRIMARY KEY,
	room_id BIGINT NOT NULL,
	created_by BIGINT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW(),
	mess VARCHAR(500),
	CONSTRAINT fk_mess_room FOREIGN KEY(room_id) REFERENCES rooms(id),
	CONSTRAINT fk_mess_user FOREIGN KEY(created_by) REFERENCES users(id)
);

-- --------------
-- importing data
-- --------------

INSERT INTO users(name, password) VALUES
('igor', '71d29208b165bbb80ddacc6cca73262c'),
('iura', '71d29208b165bbb80ddacc6cca73262c');
-- password - md5< md5<123> + HASH >

INSERT INTO rooms(title, created_by) VALUES
('first chat room', 1);

INSERT INTO mess(room_id, created_by, mess) VALUES
(1, 1, 'hai macar sa lucreze'),
(1, 2, 'un chat poti sal disvolti pina la infinit'),
(1, 2, 'si pin poti sa faci'),
(1, 2, 'si forward'),
(1, 1, 'macar sa lucreze');
