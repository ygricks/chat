-- --------------
-- commands
-- --------------

-- docker exec -it chat_postgres bash - login container with db
-- psql -U postgres - login postgres
-- \l - show databases
-- \c - connect to db
-- \dt - show tables

-- --------------
-- tables
-- --------------

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(70) NOt NULL
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
('igor', '$2a$10$LLRgDiWSP4iePSrLqOVFke5U7x0TVcBhaQb/jPh9XdsJnat7BhWiO'),
('iura', '$2a$10$.0PW9BTyDfSxNt96SBP/weJ46jo.zYvsGg0chO644Jr737h8bWJpG');

INSERT INTO rooms(title, created_by) VALUES
('first chat room', 1);

INSERT INTO mess(room_id, created_by, mess) VALUES
(1, 1, 'hai macar sa lucreze'),
(1, 2, 'un chat poti sal disvolti pina la infinit'),
(1, 2, 'si pin poti sa faci'),
(1, 2, 'si forward'),
(1, 1, 'macar sa lucreze');
