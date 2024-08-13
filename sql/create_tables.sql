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
(1, 1, 'macar sa lucreze'),
(1, 2, '---'),
(1, 1, 'Limba noastră-i o comoară'),
(1, 1, 'În adîncuri înfundată,'),
(1, 1, 'Un şirag de piatră rară'),
(1, 1, 'Pe moşie revărsată.'),
(1, 2, 'Limba noastră-i foc, ce arde'),
(1, 2, 'Într-un neam, ce fără veste '),
(1, 2, 'S-a trezit din somn de moarte,'),
(1, 2, 'Ca viteazul din poveste.'),
(1, 1, 'Limba noastră-i frunză verde, '),
(1, 1, 'Zbuciumul din codrii veşnici, '),
(1, 1, 'Nistrul lin, ce-n valuri pierde '),
(1, 1, 'Ai luceferilor sfeşnici.'),
(1, 2, 'Limba noastră-i limbă sfîntă,'),
(1, 2, 'Limba vechilor cazanii,'),
(1, 2, 'Care-o plîng şi care-o cîntă'),
(1, 2, 'Pe la vatra lor ţăranii.'),
(1, 1, 'Răsări-va o comoară '),
(1, 1, 'În adîncuri înfundată,'),
(1, 1, 'Un şirag de piatră rară'),
(1, 1, 'Pe moşie revărsată.');
