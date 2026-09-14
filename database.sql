--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-09-14 20:40:24

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 18414)
-- Name: game_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_players (
    id integer NOT NULL,
    game_id integer NOT NULL,
    user_id integer NOT NULL,
    team integer NOT NULL,
    CONSTRAINT game_players_team_check CHECK ((team = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE public.game_players OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18413)
-- Name: game_players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_players_id_seq OWNER TO postgres;

--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 221
-- Name: game_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_players_id_seq OWNED BY public.game_players.id;


--
-- TOC entry 220 (class 1259 OID 18403)
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id integer NOT NULL,
    target_score integer NOT NULL,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    finished_at timestamp without time zone,
    team1_party_wins integer DEFAULT 0 NOT NULL,
    team2_party_wins integer DEFAULT 0 NOT NULL,
    player_count integer NOT NULL,
    team3_party_wins integer DEFAULT 0 NOT NULL,
    CONSTRAINT games_player_count_check CHECK ((player_count = ANY (ARRAY[2, 3, 4]))),
    CONSTRAINT games_target_score_check CHECK ((target_score = ANY (ARRAY[501, 701, 1001])))
);


ALTER TABLE public.games OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 18402)
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.games_id_seq OWNER TO postgres;

--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 219
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;


--
-- TOC entry 224 (class 1259 OID 18434)
-- Name: parties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parties (
    id integer NOT NULL,
    game_id integer NOT NULL,
    party_number integer NOT NULL,
    team1_score integer DEFAULT 0 NOT NULL,
    team2_score integer DEFAULT 0 NOT NULL,
    winning_team integer,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    finished_at timestamp without time zone,
    team3_score integer DEFAULT 0 NOT NULL,
    CONSTRAINT parties_winning_team_check CHECK ((winning_team = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE public.parties OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 18433)
-- Name: parties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parties_id_seq OWNER TO postgres;

--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 223
-- Name: parties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parties_id_seq OWNED BY public.parties.id;


--
-- TOC entry 228 (class 1259 OID 18481)
-- Name: round_bids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.round_bids (
    id integer NOT NULL,
    round_id integer NOT NULL,
    user_id integer NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    CONSTRAINT round_bids_points_check CHECK ((points >= 0))
);


ALTER TABLE public.round_bids OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 18480)
-- Name: round_bids_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.round_bids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.round_bids_id_seq OWNER TO postgres;

--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 227
-- Name: round_bids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.round_bids_id_seq OWNED BY public.round_bids.id;


--
-- TOC entry 226 (class 1259 OID 18452)
-- Name: rounds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rounds (
    id integer NOT NULL,
    party_id integer NOT NULL,
    round_number integer NOT NULL,
    caller_user_id integer,
    trump character varying(20) NOT NULL,
    team1_points integer DEFAULT 0 NOT NULL,
    team2_points integer DEFAULT 0 NOT NULL,
    team1_bids integer DEFAULT 0 NOT NULL,
    team2_bids integer DEFAULT 0 NOT NULL,
    team1_total integer DEFAULT 0 NOT NULL,
    team2_total integer DEFAULT 0 NOT NULL,
    failed boolean DEFAULT false NOT NULL,
    stiglja boolean DEFAULT false NOT NULL,
    stiglja_team integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    team3_points integer DEFAULT 0 NOT NULL,
    team3_bids integer DEFAULT 0 NOT NULL,
    team3_total integer DEFAULT 0 NOT NULL,
    CONSTRAINT rounds_stiglja_team_check CHECK (((stiglja_team IS NULL) OR (stiglja_team = ANY (ARRAY[1, 2, 3]))))
);


ALTER TABLE public.rounds OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18451)
-- Name: rounds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rounds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rounds_id_seq OWNER TO postgres;

--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 225
-- Name: rounds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rounds_id_seq OWNED BY public.rounds.id;


--
-- TOC entry 218 (class 1259 OID 18378)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 18377)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4673 (class 2604 OID 18417)
-- Name: game_players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_players ALTER COLUMN id SET DEFAULT nextval('public.game_players_id_seq'::regclass);


--
-- TOC entry 4668 (class 2604 OID 18406)
-- Name: games id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);


--
-- TOC entry 4674 (class 2604 OID 18437)
-- Name: parties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parties ALTER COLUMN id SET DEFAULT nextval('public.parties_id_seq'::regclass);


--
-- TOC entry 4692 (class 2604 OID 18484)
-- Name: round_bids id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.round_bids ALTER COLUMN id SET DEFAULT nextval('public.round_bids_id_seq'::regclass);


--
-- TOC entry 4679 (class 2604 OID 18455)
-- Name: rounds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds ALTER COLUMN id SET DEFAULT nextval('public.rounds_id_seq'::regclass);


--
-- TOC entry 4666 (class 2604 OID 18381)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4877 (class 0 OID 18414)
-- Dependencies: 222
-- Data for Name: game_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_players (id, game_id, user_id, team) FROM stdin;
1	1	2	1
2	1	1	1
3	1	3	2
4	1	4	2
\.


--
-- TOC entry 4875 (class 0 OID 18403)
-- Dependencies: 220
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, target_score, started_at, finished_at, team1_party_wins, team2_party_wins, player_count, team3_party_wins) FROM stdin;
1	501	2026-09-04 16:58:54.992192	2026-09-04 16:58:54.992192	1	0	4	0
\.


--
-- TOC entry 4879 (class 0 OID 18434)
-- Dependencies: 224
-- Data for Name: parties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parties (id, game_id, party_number, team1_score, team2_score, winning_team, started_at, finished_at, team3_score) FROM stdin;
1	1	1	540	136	1	2026-09-04 16:58:54.992192	2026-09-04 16:58:54.992192	0
\.


--
-- TOC entry 4883 (class 0 OID 18481)
-- Dependencies: 228
-- Data for Name: round_bids; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.round_bids (id, round_id, user_id, points) FROM stdin;
1	1	2	100
\.


--
-- TOC entry 4881 (class 0 OID 18452)
-- Dependencies: 226
-- Data for Name: rounds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rounds (id, party_id, round_number, caller_user_id, trump, team1_points, team2_points, team1_bids, team2_bids, team1_total, team2_total, failed, stiglja, stiglja_team, created_at, team3_points, team3_bids, team3_total) FROM stdin;
1	1	1	2	Srce	122	40	100	0	222	40	f	f	\N	2026-09-04 16:58:54.992192	0	0	0
2	1	2	2	Bundeva	162	0	0	0	252	0	f	t	2	2026-09-04 16:58:54.992192	0	0	0
3	1	3	3	Bundeva	66	96	0	0	66	96	f	f	\N	2026-09-04 16:58:54.992192	0	0	0
\.


--
-- TOC entry 4873 (class 0 OID 18378)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, created_at) FROM stdin;
1	Antonio	$2b$10$Mzlhua0FGhh9EUFSSfwlMOPlWeJCleoVdqQZgJGGrfGMBuFrYGnfq	2026-08-28 21:20:26.43804
2	ameles	$2b$10$yRzp8ByHnFMnmyR2y00gN.HfrQEp2i2gnc.MrzXdN/MxZdvJ3cqWK	2026-08-28 21:37:32.902903
3	probni	$2b$10$QGo8WW12hu.KEUfyqSpzRebA2RDTLV7Td629o0bUxDleZf5C/plU6	2026-08-29 12:07:43.100516
4	probni2	$2b$10$Kl6r05O8OPbaOI9j1RXf6Os79oSrWtDK9l9/ZFztQ6QbmYScESjS6	2026-08-29 12:08:10.405107
\.


--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 221
-- Name: game_players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_players_id_seq', 4, true);


--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 219
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.games_id_seq', 1, true);


--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 223
-- Name: parties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parties_id_seq', 1, true);


--
-- TOC entry 4898 (class 0 OID 0)
-- Dependencies: 227
-- Name: round_bids_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.round_bids_id_seq', 1, true);


--
-- TOC entry 4899 (class 0 OID 0)
-- Dependencies: 225
-- Name: rounds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rounds_id_seq', 3, true);


--
-- TOC entry 4900 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 4707 (class 2606 OID 18422)
-- Name: game_players game_players_game_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_players
    ADD CONSTRAINT game_players_game_id_user_id_key UNIQUE (game_id, user_id);


--
-- TOC entry 4709 (class 2606 OID 18420)
-- Name: game_players game_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_players
    ADD CONSTRAINT game_players_pkey PRIMARY KEY (id);


--
-- TOC entry 4705 (class 2606 OID 18412)
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- TOC entry 4711 (class 2606 OID 18445)
-- Name: parties parties_game_id_party_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_game_id_party_number_key UNIQUE (game_id, party_number);


--
-- TOC entry 4713 (class 2606 OID 18443)
-- Name: parties parties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_pkey PRIMARY KEY (id);


--
-- TOC entry 4719 (class 2606 OID 18488)
-- Name: round_bids round_bids_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.round_bids
    ADD CONSTRAINT round_bids_pkey PRIMARY KEY (id);


--
-- TOC entry 4715 (class 2606 OID 18469)
-- Name: rounds rounds_party_id_round_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_party_id_round_number_key UNIQUE (party_id, round_number);


--
-- TOC entry 4717 (class 2606 OID 18467)
-- Name: rounds rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_pkey PRIMARY KEY (id);


--
-- TOC entry 4701 (class 2606 OID 18386)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4703 (class 2606 OID 18388)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4720 (class 2606 OID 18423)
-- Name: game_players game_players_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_players
    ADD CONSTRAINT game_players_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- TOC entry 4721 (class 2606 OID 18428)
-- Name: game_players game_players_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_players
    ADD CONSTRAINT game_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4722 (class 2606 OID 18446)
-- Name: parties parties_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parties
    ADD CONSTRAINT parties_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- TOC entry 4725 (class 2606 OID 18489)
-- Name: round_bids round_bids_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.round_bids
    ADD CONSTRAINT round_bids_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.rounds(id) ON DELETE CASCADE;


--
-- TOC entry 4726 (class 2606 OID 18494)
-- Name: round_bids round_bids_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.round_bids
    ADD CONSTRAINT round_bids_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4723 (class 2606 OID 18475)
-- Name: rounds rounds_caller_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_caller_user_id_fkey FOREIGN KEY (caller_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4724 (class 2606 OID 18470)
-- Name: rounds rounds_party_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_party_id_fkey FOREIGN KEY (party_id) REFERENCES public.parties(id) ON DELETE CASCADE;


-- Completed on 2026-09-14 20:40:25

--
-- PostgreSQL database dump complete
--

