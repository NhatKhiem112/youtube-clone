-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 08, 2025 lúc 01:27 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `youtube_clone`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `disliked_videos`
--

CREATE TABLE `disliked_videos` (
  `id` bigint(20) NOT NULL,
  `channel_title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `disliked_at` datetime(6) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `video_id` varchar(255) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `disliked_videos`
--

INSERT INTO `disliked_videos` (`id`, `channel_title`, `description`, `disliked_at`, `thumbnail_url`, `title`, `video_id`, `user_id`) VALUES
(20, 'Oops Hiha', 'HIHA THỬ THÁCH 3H ĐÊM CHƠI MA LAI HIHA AUT TRONG MINECRAFT * HIHA AUT MA LAI 😱\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n▬▬\nÊy zô mình là HihaChobi đây nè :3\nHôm nay cùng mình xem 1 thử thách với hiha aut nhaa\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n► Game của Hiha : \n⭐️ Minecraft - HihaCity IP : play.hihacity.net ( phiên bản 1.20.4 )\n- Discord HihaCity : https://discord.gg/hihacity-1205154193585741844 \n🏠 Roblox - Hiha Aut Tycoon ( Chưa ra mắt ) \n- Discord HihaAut Tycoon : https://discord.gg/hHNmEabkmv\n\nTham gia làm hội viên của kênh này để được hưởng đặc quyền:\nhttps://www.youtube.com/channel/UCtT5uP2WIGxyP0MYCC_ZHtQ/join\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ \n🎬 ĐĂNG KÝ HihaChobi ►: https://goo.gl/CbZzbe\n📰 FACEBOOK FANPAGE ►: https://goo.gl/1SejY7\n📰Nhóm fan của Hiha ► :  https://bit.ly/2HmWiiY\n📰 Liên hệ hợp tác và quảng cáo \n► Gmail : partners@kydstudio.com\n► Facebook : https://www.facebook.com/HihaChobi\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ \n♦️ĐĂNG KÝ CHO SINH TỐ TEAM ♦️  : \n► 💟 Oops Hiha : http://bit.ly/Hihaaa\n► 🌀 Yummie TV : h', '2025-05-03 14:21:11.000000', 'https://i.ytimg.com/vi/_5VSz-IMO5E/hqdefault.jpg', 'HIHA THỬ THÁCH 3H ĐÊM CHƠI MA LAI HIHA AUT TRONG MINECRAFT * HIHA AUT MA LAI 😱', '_5VSz-IMO5E', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `liked_videos`
--

CREATE TABLE `liked_videos` (
  `id` bigint(20) NOT NULL,
  `channel_title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `liked_at` datetime(6) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `video_id` varchar(255) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `liked_videos`
--

INSERT INTO `liked_videos` (`id`, `channel_title`, `description`, `liked_at`, `thumbnail_url`, `title`, `video_id`, `user_id`) VALUES
(5, 'Sơn Tùng M-TP Official', 'SON TUNG M-TP - \"HÃY TRAO CHO ANH\" | GIVE IT TO ME\nM-TP ENTERTAINMENT\n\nAvailable on Nhaccuatui: @http://nhaccuatui.com/sontungmtp/haytraochoanh\nAvailable on Spotify: @https://spoti.fi/2YodgS6\nAvailable on iTunes: @https://apple.co/2xknmaI\n\nExecutive Producer: Nguyen Thanh Tung \nComposer: Son Tung M-TP \nMusic Producer: ONIONN\nArtist: Son Tung M-TP\nFeaturing with: Snoop Dogg (Snoop Dogg appears courtesy of Doggy Style Records)\nMain Actress: Madison Beer\nProject Producer: M&M House\n\nProject management: Chau LE\nMarketing Director: Henry Nguyen\nPR Executive: Nhat Duy\nTalent Manager: Tran Song Hanh Nhan\n\nPRODUCTION TEAM\nMusic Video Production: August Frogs \nDirector: Korlio\nProducer: Sunok Hong\nLocal Producer: Christopher Lee\nAssistant Director: Kyuho Sung\nCGI: Jiun Kim\nPhotographer: Jiun Kim\nPoster Designer: Jiun Kim\nStylist: Hary Hong\nHair Stylist: Hyunwoo Lee\nMakeup: Eunyeong Baek\nChoreographer: Luana Simpson Fowler\nDancer: Geovane Fidelis\n\nSPECIAL THANKS TO\nArtist Agency (Project Execute', '2025-04-28 03:43:09.000000', 'https://i.ytimg.com/vi/knW7-x7Y7RE/hqdefault.jpg', 'SƠN TÙNG M-TP | HÃY TRAO CHO ANH ft. Snoop Dogg | Official MV', 'knW7-x7Y7RE', 2),
(9, 'Khắc Hưng', 'CAY - KHẮC HƯNG, JIMMII NGUYỄN | OFFICIAL MUSIC VIDEO\n\nStream here: https://umvn.lnk.to/CAY\n\nComposer: Khắc Hưng\nMusic Producer: Khắc Hưng\nMix & Master: Khắc Hưng\nSinger: Khắc Hưng, Jimmii Nguyễn\n\nCreative & Script Writer: Nhu Đặng - Ngô Đài Trang\nDirector: Nhu Đặng\nProducer: Hoài Nam\n\nRECORD LABEL:\nUNIVERSAL MUSIC VIETNAM\n\nLyrics:\nMưa ơi rơi làm chi\nMưa đừng trêu tôi nữa để tôi một mình\nMưa mang bao sầu bi\nBao hạt mưa rơi xuống tựa như cực hình\nBiết yêu là hoang đường\nMà sao như mù phương hướng\nCứ đâm đầu lao vào\nRồi đâm ngay vào tường\nNgỡ yêu được đúng người\nMà người thay anh bằng người mới (oh no)\nGiờ mới hay tình yêu với em như trò chơi\n\nNgày vui đã tan\nTình ta cũng tan tành\nMình anh giữa đêm\nNgoài đường phố mưa lạnh\nNhìn khói thuốc bay\nLòng sao thấy khô cằn\nVị thuốc lá cay\nMà không thấy cay bằng\nNgày em đá anh\n\nBaby anh biết em đang chilling and vibing bên ai\nBaby anh biết em đang dancing and getting high\nAnh không quan tâm em đã khiến anh đau\nNhưng anh ta tốt đẹp gì hơn anh đâu?\n', '2025-04-29 12:35:05.000000', 'https://i.ytimg.com/vi/5eYevf1PmcU/hqdefault.jpg', 'CAY - KHẮC HƯNG, JIMMII NGUYỄN | OFFICIAL MUSIC VIDEO', '5eYevf1PmcU', 2),
(33, 'HIEUTHUHAI', '#HIEUTHUHAI #hieuthuhai #NMCS\n\nHIEUTHUHAI - Nước Mắt Cá Sấu (prod. by Kewtiie) l Official Music Video\n-------------------------\nStream Audio: https://mmusicrecords.lnk.to/NMCS\n-------------------------\nMusic Producer: Kewtiie \nComposer: HIEUTHUHAI\nMixing: HIEUTHUHAI, MIXEDBYQUAN\nMastering: Kewtiie\n\nCommercial Management: NOMAD MGMT Vietnam\nArtist Management: Minh Khoa \n\nProduced by Kameleon Studio x Children Of\nExecutive Producer: Tony Nhat Nguyen\nDirector: Choānn\nProducers: Hoang Duy Khanh, Hong Vy Tran \nLine Producer: Trần Dương (Keisha)\nProduction Manager: Kim Phan \nPartnership Manager: Tâm Anh\nAssistant to Producers: Đỗ Như, Salem Trương, Anh Thy, Đạt Võ\nProduction Assistant: Salem Trương, Đạt Võ\n1st AD: Hồ Nguyên Minh Thư\nDOP: Kelvin Chew\nSteadicam: Bi Hân (Steadihan) \nSteadicam Assistant: Trương Cao Kỳ\nProduction Designer: AI Team\nArt Director: Đại Hưng\nAssistant Art Directors: Canh Nguyen, Gia Bảo\nSet Designer: Mai Ngọc\nProps Master: Tí Chuột, Quốc Cường\n\nEquipment & Lighting: P', '2025-05-04 18:36:48.000000', 'https://i.ytimg.com/vi/zaYS8tiD0Og/hqdefault.jpg', 'HIEUTHUHAI - Nước Mắt Cá Sấu (prod. by Kewtiie) l Official Music Video', 'zaYS8tiD0Og', 2),
(44, 'MCK // Nger', 'indie vcl luon day\n#mck #thapdrilltudo #nghiemtong\n-------------------\nSubscribe to my channel: https://metub.net/rptmck\n\nFollow MCK:\nInstagram: https://instagram.com/rpt.mckeyyyyy/\nFacebook: https://www.facebook.com/hoanglongmck\nSoundCloud: https://soundcloud.com/hoanglongnger\n\nThông tin liên hệ xin vui lòng gửi về: cdslthemovement@gmail.com\n\nBản quyền Video thuộc về MCK // Nger CDSL\nXin vui lòng liên hệ trước khi sử dụng cũng như re-upload dưới mọi hình thức.', '2025-05-07 12:02:09.000000', 'https://i.ytimg.com/vi/VLvBlG49BKA/hqdefault.jpg', 'thap drill tu do - nghiem tong prod. gaz', 'VLvBlG49BKA', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reports`
--

CREATE TABLE `reports` (
  `id` bigint(20) NOT NULL,
  `additional_info` text DEFAULT NULL,
  `channel_title` varchar(255) DEFAULT NULL,
  `report_reason` varchar(255) NOT NULL,
  `reported_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `video_id` varchar(255) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reason` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reports`
--

INSERT INTO `reports` (`id`, `additional_info`, `channel_title`, `report_reason`, `reported_at`, `status`, `thumbnail_url`, `title`, `updated_at`, `video_id`, `user_id`, `created_at`, `description`, `reason`) VALUES
(4, NULL, NULL, 'spam_misleading', NULL, 'REVIEWED', NULL, 'Report', '2025-05-03 14:39:41.000000', 'B3wR-ZVe0Rw', 2, '2025-05-03 14:14:37.000000', '', 'spam_misleading'),
(5, NULL, NULL, 'harmful_dangerous_content', NULL, 'RESOLVED', NULL, 'trường học bờ rên rốt tập 2 #shorts', '2025-05-03 15:43:09.000000', 'AEXc8qIu47s', 2, '2025-05-03 15:42:28.000000', '', 'harmful_dangerous_content'),
(6, NULL, NULL, 'harmful_dangerous_content', NULL, 'REVIEWED', NULL, 'Khi Tralalero Tralala Cứu Sheep | Sheep #shorts', '2025-05-04 09:37:24.000000', 'rYtZAds6SJw', 2, '2025-05-04 09:36:54.000000', '', 'harmful_dangerous_content');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` enum('ROLE_USER','ROLE_MODERATOR','ROLE_ADMIN') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'ROLE_USER'),
(2, 'ROLE_MODERATOR'),
(3, 'ROLE_ADMIN');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) NOT NULL,
  `notification_enabled` bit(1) NOT NULL,
  `subscribed_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `channel_id` bigint(20) NOT NULL,
  `subscriber_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `channel_description` varchar(1000) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(120) DEFAULT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `subscriber_count` bigint(20) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `verified` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `channel_description`, `created_at`, `email`, `password`, `profile_image_url`, `subscriber_count`, `updated_at`, `username`, `verified`) VALUES
(2, NULL, '2025-04-28 03:36:35.000000', 'khiem@gmail.com', '$2a$10$SZ98WYQk98PrbWFTAFGFi.FEldKNQr9uvZlR4Wm3fXNubCUmj2tbO', NULL, 0, '2025-05-01 14:45:44.000000', 'nhatkhiem', b'0'),
(6, NULL, '2025-05-01 14:57:42.000000', 'admin@gmail.com', '$2a$10$S1St1U5AVn/A4ZTlep3rY.o8w3ZVj18Bo6sIwAxGeoSGSLcvW95Qq', NULL, 0, '2025-05-01 14:57:42.000000', 'admin', b'0'),
(13, NULL, '2025-05-07 12:02:43.000000', 'lam@gmail.com', '$2a$10$.NgBM7GGRufulLDZlOEV3ubxWrojyN6wKrfHvYpSeRYgpm.oRNcEG', NULL, 0, '2025-05-07 12:02:43.000000', 'Lâm', b'0');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` bigint(20) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(2, 1),
(6, 3),
(13, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `videos`
--

CREATE TABLE `videos` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `dislike_count` int(11) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `like_count` int(11) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `video_file_name` varchar(255) NOT NULL,
  `video_file_size` bigint(20) DEFAULT NULL,
  `video_file_type` varchar(255) NOT NULL,
  `video_url` varchar(255) NOT NULL,
  `view_count` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `reviewed_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `videos`
--

INSERT INTO `videos` (`id`, `created_at`, `description`, `dislike_count`, `duration`, `like_count`, `status`, `thumbnail_url`, `title`, `updated_at`, `video_file_name`, `video_file_size`, `video_file_type`, `video_url`, `view_count`, `user_id`, `rejection_reason`, `reviewed_by`) VALUES
(9, '2025-05-07 13:18:14.000000', 'Đây là nội dung đã được cập nhật với thông tin mới', 0, NULL, 0, 'PUBLIC', '/videos/thumbnail/0c471fc6-d899-4530-b865-e581c40bfa7f_images.jpg', 'Video moi cp nhat', '2025-05-07 13:19:47.000000', '6080cc0e-45e8-4ff8-80ab-efb184b2645a_567.mp4', 36681483, 'video/mp4', '/videos/stream/6080cc0e-45e8-4ff8-80ab-efb184b2645a_567.mp4', 0, 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `watched_videos`
--

CREATE TABLE `watched_videos` (
  `id` bigint(20) NOT NULL,
  `channel_title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `last_watched_at` datetime(6) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `video_id` varchar(255) NOT NULL,
  `watch_count` int(11) DEFAULT NULL,
  `watched_at` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `watched_videos`
--

INSERT INTO `watched_videos` (`id`, `channel_title`, `description`, `last_watched_at`, `thumbnail_url`, `title`, `video_id`, `watch_count`, `watched_at`, `user_id`) VALUES
(9, 'Obito Official', 'KEEP IN TOUCH WITH OBITO\nFacebook: https://web.facebook.com/youngtobiedasick\nInstagram: https://www.instagram.com/youngtobieedasick/\nFanpage: https://web.facebook.com/youngtobieedasick\n\n© 2025 Obito', '2025-05-07 07:37:55.000000', 'https://i.ytimg.com/vi/ealfjTQEI4Q/hqdefault.jpg', 'thap trap tu do (remix) - lý lữ ca prod. tyronee', 'ealfjTQEI4Q', 3, '2025-05-01 15:13:56.000000', 2),
(10, 'Donald Gold', 'Audio: https://onerpm.link/ADAMN\n\nMusic Producer : Zane98,Peyseyko808,LMC,T9C\nComposer : Donald Gold\nMix Master :Anh Bin', '2025-05-03 14:39:06.000000', 'https://i.ytimg.com/vi/B3wR-ZVe0Rw/hqdefault.jpg', 'DONALD GOLD - ADAMN  [OFFICIAL MV]', 'B3wR-ZVe0Rw', 32, '2025-05-01 16:47:27.000000', 2),
(11, 'Bi Huỳnh Gaming', '▶️Shop pack One Piece chính hãng, phụ kiện anime: https://shope.ee/5V3SfbWWr4\n---------------\nNếu mn thấy thích thì đừng quên để lại cho mình 1 like & share cũng như đăng ký kênh để giúp mình ra video nhanh hơn nha!!!! Love u\n▶️Facebook của mình: https://www.facebook.com/bihuynh199x\n▶️Discord: https://discord.gg/bihuynhgaming\n\nBI HUỲNH THỬ THÁCH 24H TRADE TẤT CẢ TRÁI MỚI BẤT NGỜ ĐƯỢC QUÁ NHIỀU RỒNG TRONG BLOX FRUITS\n---------------------------------------------------------\nHỢP TÁC MỜI LIÊN HỆ: \nEmail: bihuynh199x@gmail.com\n© Youtube Partner\n\n#roblox #bloxfruits #bihuynh', '2025-05-01 16:49:15.000000', 'https://i.ytimg.com/vi/oW1kJRBf0Vs/hqdefault.jpg', 'BI HUỲNH HÀNH TRÌNH RANDOM 200 TRÁI ÁC QUỶ TÌM TOÀN BỘ TRÁI THẦN THOẠI TRONG BLOX FRUIT', 'oW1kJRBf0Vs', 1, '2025-05-01 16:49:15.000000', 2),
(12, 'Oops Hiha', 'HIHA THỬ THÁCH 3H ĐÊM CHƠI MA LAI HIHA AUT TRONG MINECRAFT * HIHA AUT MA LAI 😱\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n▬▬\nÊy zô mình là HihaChobi đây nè :3\nHôm nay cùng mình xem 1 thử thách với hiha aut nhaa\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n► Game của Hiha : \n⭐️ Minecraft - HihaCity IP : play.hihacity.net ( phiên bản 1.20.4 )\n- Discord HihaCity : https://discord.gg/hihacity-1205154193585741844 \n🏠 Roblox - Hiha Aut Tycoon ( Chưa ra mắt ) \n- Discord HihaAut Tycoon : https://discord.gg/hHNmEabkmv\n\nTham gia làm hội viên của kênh này để được hưởng đặc quyền:\nhttps://www.youtube.com/channel/UCtT5uP2WIGxyP0MYCC_ZHtQ/join\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ \n🎬 ĐĂNG KÝ HihaChobi ►: https://goo.gl/CbZzbe\n📰 FACEBOOK FANPAGE ►: https://goo.gl/1SejY7\n📰Nhóm fan của Hiha ► :  https://bit.ly/2HmWiiY\n📰 Liên hệ hợp tác và quảng cáo \n► Gmail : partners@kydstudio.com\n► Facebook : https://www.facebook.com/HihaChobi\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ \n♦️ĐĂNG KÝ CHO SINH TỐ TEAM ♦️  : \n► 💟 Oops Hiha : http://bit.ly/Hihaaa\n► 🌀 Yummie TV : h', '2025-05-03 14:21:08.000000', 'https://i.ytimg.com/vi/_5VSz-IMO5E/hqdefault.jpg', 'HIHA THỬ THÁCH 3H ĐÊM CHƠI MA LAI HIHA AUT TRONG MINECRAFT * HIHA AUT MA LAI 😱', '_5VSz-IMO5E', 1, '2025-05-03 14:21:08.000000', 2),
(13, 'Ô Kìa Hiệp', 'Xin chào các bạn, nếu thích thì share và subscribe cho mình để xem nhiều video mới hơn nhé!!!! \r\n\r\n--------------------\r\nNgoài ra thì tớ hoạt động chủ yếu trên Facebook nha :3\r\n► Fanpage: http://fb.com/hiepdo95\r\n► Instagram: http://instagram.com/hiep.fanxychild\r\n► Facebook: http://fb.com/okiahiep\r\n--------------------\r\nLiên hệ quảng cáo viral :\r\nEmail: jihyoholic@gmail.com.\r\nTrực tiếp qua fb cá nhân.\r\n---------------------\r\n© Bản quyền thuộc về HiepDo', '2025-05-04 15:34:51.000000', 'https://i.ytimg.com/vi/AEXc8qIu47s/hqdefault.jpg', 'trường học bờ rên rốt tập 2 #shorts', 'AEXc8qIu47s', 10, '2025-05-03 15:35:50.000000', 2),
(14, 'Sheep Farm', '---\n► Đăng Ký Kênh \"Sheep Farm\": https://bit.ly/3ygGILT\n► Đăng Ký Kênh \"Sheep\": https://bit.ly/3rMzexz\n------------------------------------------\n#sheep #sheepfarm #roblox #metub #metubnetwork\n------------------------------------------\n© Bản quyền thuộc về Sheep\n© Copyright by Sheep ☞ Do not Reup\n\"METUB Network - Mạng lưới các nhà sáng tạo nội dung hàng đầu Châu Á\"', '2025-05-04 09:36:44.000000', 'https://i.ytimg.com/vi/rYtZAds6SJw/hqdefault.jpg', 'Khi Tralalero Tralala Cứu Sheep | Sheep #shorts', 'rYtZAds6SJw', 1, '2025-05-04 09:36:44.000000', 2),
(15, 'Khắc Hưng', 'CAY - KHẮC HƯNG, JIMMII NGUYỄN | OFFICIAL MUSIC VIDEO\n\nStream here: https://umvn.lnk.to/CAY\n\nComposer: Khắc Hưng\nMusic Producer: Khắc Hưng\nMix & Master: Khắc Hưng\nSinger: Khắc Hưng, Jimmii Nguyễn\n\nCreative & Script Writer: Nhu Đặng - Ngô Đài Trang\nDirector: Nhu Đặng\nProducer: Hoài Nam\n\nRECORD LABEL:\nUNIVERSAL MUSIC VIETNAM\n\nLyrics:\nMưa ơi rơi làm chi\nMưa đừng trêu tôi nữa để tôi một mình\nMưa mang bao sầu bi\nBao hạt mưa rơi xuống tựa như cực hình\nBiết yêu là hoang đường\nMà sao như mù phương hướng\nCứ đâm đầu lao vào\nRồi đâm ngay vào tường\nNgỡ yêu được đúng người\nMà người thay anh bằng người mới (oh no)\nGiờ mới hay tình yêu với em như trò chơi\n\nNgày vui đã tan\nTình ta cũng tan tành\nMình anh giữa đêm\nNgoài đường phố mưa lạnh\nNhìn khói thuốc bay\nLòng sao thấy khô cằn\nVị thuốc lá cay\nMà không thấy cay bằng\nNgày em đá anh\n\nBaby anh biết em đang chilling and vibing bên ai\nBaby anh biết em đang dancing and getting high\nAnh không quan tâm em đã khiến anh đau\nNhưng anh ta tốt đẹp gì hơn anh đâu?\n', '2025-05-07 05:37:33.000000', 'https://i.ytimg.com/vi/5eYevf1PmcU/hqdefault.jpg', 'CAY - KHẮC HƯNG, JIMMII NGUYỄN | OFFICIAL MUSIC VIDEO', '5eYevf1PmcU', 6, '2025-05-04 10:13:36.000000', 2),
(16, 'nhatkhiem', 'rất tuyệt vời', '2025-05-07 06:14:20.000000', 'http://localhost:8080/videos/thumbnail/c7e60259-c3e2-4982-a7be-c2ca226f51e8_images.jpg', 'game tv', '3', 29, '2025-05-06 08:54:02.000000', 2),
(17, 'YouTube', 'This is an external YouTube video', '2025-05-06 11:51:23.000000', '', 'YouTube Video', '0', 4, '2025-05-06 11:50:16.000000', 2),
(18, 'J97', 'JACK - J97 | 01 NGOẠI LỆ | Track No.2\n#JackJ97 #NgoaiLe #J97 #bhmedia \nBài nhạc được viết ngẫu hứng phối và hoàn thiện trong 2 ngày, thu âm từ xa hihi, có điều chi sai sót quý khán giả bỏ qua ^^\n\n\nPRODUCT BY J97 ENTERTAINMENT \nCOMPOSER & SINGER: JACK - J97\nARRANGER: Vịtconbóngđêm\nRECORD: Trương Minh Thơ\n\nVIDEOGRAPHY: BH MEDIA \nVIDEO NETWORK PUBLISHER & DISTRIBUTOR : BH MEDIA\n\nMakeup artist : KKK\nAssistant : Huynh Bao Bao - Mi \nSpecial makeup effects : Le Trien Luong - Bow Tran - Fero Kong\n\nHairstylist : Thythy Nguyen - Hairoin Trinh Hoai Duc\nAssistant : Khai Phan\n\nStylist : Loriann  - Tran Cong Linh\n\nPhoto : Ngo Viet Dai Duong\nArt Design : Đinh Thien Phu\n\nHOOK:\nNgười nói xem tình yêu giờ câu gì?\nLời nào còn trên mi, còn trên mi\nEM vội đi khi mà ANH vẫn còn mơ giấc mộng xanh\n\nMặn đắng duyên tình yêu giờ không thành\nMột nụ hồng mong manh, hồng mong manh\nNghe thời gian như nặng mang ngay từ giây phút tình tan ….\n\nVER 1:\n\nEM ơi EM gạt ANH chi cho ANH cô đơn đau lòng trong mưa ngâu\nANH mang', '2025-05-06 12:14:48.000000', 'https://i.ytimg.com/vi/KYrnTn9nXFI/hqdefault.jpg', 'JACK - J97 | 01 NGOẠI LỆ | Track No.2', 'KYrnTn9nXFI', 1, '2025-05-06 12:14:48.000000', 2),
(19, 'nhatkhiem', 'mới mẻ', '2025-05-07 11:04:06.000000', 'http://localhost:8080/api/videos/thumbnail/74444270-e03a-4005-a891-3fa8c0497ada_images.jpg', 'chu đe ', '4', 12, '2025-05-07 06:16:19.000000', 2),
(20, 'nhatkhiem', 'êqwqew', '2025-05-07 12:15:26.000000', 'http://localhost:8080/api/videos/thumbnail/94ead93c-d3d0-4334-9b36-de1978c32057_Screenshot 2025-04-24 142815.png', 'okr', '5', 15, '2025-05-07 07:37:07.000000', 2),
(21, 'Rap Fan Thám Thính', 'Follow me:\nFanpage Grab Fan Tháng 9: https://www.facebook.com/grabfanthang9\nFanpage Rap Fan Thám Thính: https://www.facebook.com/rapfanthamthinh\n\nDonate: 1040314067 Vietcombank\n\n\n#gaz #thapdrilltudo #mck #drill #hazel #hiphop #music #cauphat #betekar #mashup #obito #rap #rapper', '2025-05-07 08:36:25.000000', 'https://i.ytimg.com/vi/4DA_l_Ux8bw/hqdefault.jpg', 'SIÊU LIÊN KHÚC THÁP DRILL TỰ DO - MCK x Hazel x Gió x Betekar x Obito x  Nguyễn Cú Đấm x Gnob', '4DA_l_Ux8bw', 1, '2025-05-07 08:36:25.000000', 2),
(22, '2Cá TV', 'Vũ trụ brainrot đi tách kẹo #brainrot #2catv \n📩 Quảng Cáo Liên Hệ: anh2cavn@gmail.com\nZalo: 0522696326\nFacebook: https://www.facebook.com/le.trung.hieu.821332/\n#xuhuong #freefire #2catv #bloxfruits', '2025-05-07 09:09:53.000000', 'https://i.ytimg.com/vi/39NUkctG3Gc/hqdefault.jpg', 'Vũ trụ brainrot đi tách kẹo #brainrot #2catv #squidgame', '39NUkctG3Gc', 1, '2025-05-07 09:09:53.000000', 2),
(23, 'VTV Sao Đại Chiến', 'Viết Tiếp Câu Chuyện Hòa Bình - Đông Hùng & Võ Hạ Trâm | Lễ Kỷ Niệm 50 Năm Ngày Giải Phóng Miền Nam Thống Nhất Đất Nước\n#VTV #VTVSaoDaiChien\n---------------------------------------------\n® Bản quyền thuộc về Đài truyền hình Việt Nam.', '2025-05-07 12:15:44.000000', 'https://i.ytimg.com/vi/HnGao2Zl_rE/hqdefault.jpg', 'Viết Tiếp Câu Chuyện Hòa Bình - Đông Hùng & Võ Hạ Trâm | Lễ Kỷ Niệm 50 Năm Giải Phóng Miền Nam', 'HnGao2Zl_rE', 2, '2025-05-07 12:10:33.000000', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `watch_later_videos`
--

CREATE TABLE `watch_later_videos` (
  `id` bigint(20) NOT NULL,
  `added_at` datetime(6) DEFAULT NULL,
  `channel_title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `video_id` varchar(255) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `watch_later_videos`
--

INSERT INTO `watch_later_videos` (`id`, `added_at`, `channel_title`, `description`, `thumbnail_url`, `title`, `video_id`, `user_id`) VALUES
(16, '2025-04-30 15:07:39.000000', 'Test Channel', 'Test Description', 'https://www.youtube.com/watch?v=avVpe_5lB4k&list=RDavVpe_5lB4k&start_radio=1', '100 questions', 'dQw4w9WgXcQ', 2),
(24, '2025-05-04 18:36:52.000000', 'HIEUTHUHAI', '#HIEUTHUHAI #hieuthuhai #NMCS\n\nHIEUTHUHAI - Nước Mắt Cá Sấu (prod. by Kewtiie) l Official Music Video\n-------------------------\nStream Audio: https://mmusicrecords.lnk.to/NMCS\n-------------------------\nMusic Producer: Kewtiie \nComposer: HIEUTHUHAI\nMixing: HIEUTHUHAI, MIXEDBYQUAN\nMastering: Kewtiie\n\nCommercial Management: NOMAD MGMT Vietnam\nArtist Management: Minh Khoa \n\nProduced by Kameleon Studio x Children Of\nExecutive Producer: Tony Nhat Nguyen\nDirector: Choānn\nProducers: Hoang Duy Khanh, Hong Vy Tran \nLine Producer: Trần Dương (Keisha)\nProduction Manager: Kim Phan \nPartnership Manager: Tâm Anh\nAssistant to Producers: Đỗ Như, Salem Trương, Anh Thy, Đạt Võ\nProduction Assistant: Salem Trương, Đạt Võ\n1st AD: Hồ Nguyên Minh Thư\nDOP: Kelvin Chew\nSteadicam: Bi Hân (Steadihan) \nSteadicam Assistant: Trương Cao Kỳ\nProduction Designer: AI Team\nArt Director: Đại Hưng\nAssistant Art Directors: Canh Nguyen, Gia Bảo\nSet Designer: Mai Ngọc\nProps Master: Tí Chuột, Quốc Cường\n\nEquipment & Lighting: P', 'https://i.ytimg.com/vi/zaYS8tiD0Og/hqdefault.jpg', 'HIEUTHUHAI - Nước Mắt Cá Sấu (prod. by Kewtiie) l Official Music Video', 'zaYS8tiD0Og', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `youtube_subscriptions`
--

CREATE TABLE `youtube_subscriptions` (
  `id` bigint(20) NOT NULL,
  `channel_name` varchar(255) DEFAULT NULL,
  `channel_thumbnail_url` varchar(255) DEFAULT NULL,
  `notification_enabled` bit(1) NOT NULL,
  `subscribed_at` datetime(6) DEFAULT NULL,
  `subscriber_count` bigint(20) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `youtube_channel_id` varchar(255) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `youtube_subscriptions`
--

INSERT INTO `youtube_subscriptions` (`id`, `channel_name`, `channel_thumbnail_url`, `notification_enabled`, `subscribed_at`, `subscriber_count`, `updated_at`, `youtube_channel_id`, `user_id`) VALUES
(3, 'Sơn Tùng M-TP Official', 'https://yt3.ggpht.com/c-Z7mIlntSpG6VyQ5ZqaPggqkZRhaySr-H5ZEazFN2iR1pP4eD1UGekwu0y--c4CSVhJJ1A4QT8=s88-c-k-c0x00ffffff-no-rj', b'1', '2025-05-06 10:36:33.000000', 11400000, '2025-05-07 09:00:27.000000', 'UClyA28-01x4z60eWQ2kiNbA', 2),
(6, 'HIEUTHUHAI', 'https://yt3.ggpht.com/wTBgybVZQceW5q7GsQqhr8W22_kSY9MaBaBF6gbeLj0futM4PxxLvNzdBcmsllfAgjmYJvAn-w=s88-c-k-c0x00ffffff-no-rj', b'1', '2025-05-07 09:03:16.000000', 1210000, '2025-05-07 09:03:19.000000', 'UCe8b9jSSD-bNabF4hkNN5PQ', 2),
(10, 'MCK // Nger', 'https://yt3.ggpht.com/l5vxhDuExYW5firIfZt7VPNANUQ4wFQ4T7RL6DDoSW6Uao5aEdy-XvJu6xhJ_qeIR743Y_zm=s88-c-k-c0x00ffffff-no-rj', b'1', '2025-05-07 12:02:13.000000', 786000, '2025-05-07 12:02:15.000000', 'UC8EB7c0E_TS4tpTQwMtv6fw', 2);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `disliked_videos`
--
ALTER TABLE `disliked_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKpeyguyojhymaqci5ntnlw7tx4` (`user_id`);

--
-- Chỉ mục cho bảng `liked_videos`
--
ALTER TABLE `liked_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK1gba2xp5mqedryffu40b6xchh` (`user_id`);

--
-- Chỉ mục cho bảng `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK2o32rer9hfweeylg7x8ut8rj2` (`user_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKcl91bj6bsg2kvi3eity8yc4hk` (`subscriber_id`,`channel_id`),
  ADD KEY `FK6jw0fljimmo9qisnhob8eiv45` (`channel_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- Chỉ mục cho bảng `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`);

--
-- Chỉ mục cho bảng `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK75696octon297ywni28sk19ek` (`user_id`);

--
-- Chỉ mục cho bảng `watched_videos`
--
ALTER TABLE `watched_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKsxdqxct1ki8xo6nv4xv6ktl7l` (`user_id`);

--
-- Chỉ mục cho bảng `watch_later_videos`
--
ALTER TABLE `watch_later_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKsjdexq52tm9t0kmnaine2es94` (`user_id`);

--
-- Chỉ mục cho bảng `youtube_subscriptions`
--
ALTER TABLE `youtube_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKpuslrphj3b0xr8l9ixr6lx04n` (`user_id`,`youtube_channel_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `disliked_videos`
--
ALTER TABLE `disliked_videos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT cho bảng `liked_videos`
--
ALTER TABLE `liked_videos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT cho bảng `reports`
--
ALTER TABLE `reports`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `videos`
--
ALTER TABLE `videos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `watched_videos`
--
ALTER TABLE `watched_videos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT cho bảng `watch_later_videos`
--
ALTER TABLE `watch_later_videos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT cho bảng `youtube_subscriptions`
--
ALTER TABLE `youtube_subscriptions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `disliked_videos`
--
ALTER TABLE `disliked_videos`
  ADD CONSTRAINT `FKpeyguyojhymaqci5ntnlw7tx4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `liked_videos`
--
ALTER TABLE `liked_videos`
  ADD CONSTRAINT `FK1gba2xp5mqedryffu40b6xchh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `FK2o32rer9hfweeylg7x8ut8rj2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `FK6jw0fljimmo9qisnhob8eiv45` FOREIGN KEY (`channel_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKoodc4352epkjrvxx79odlxbji` FOREIGN KEY (`subscriber_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `videos`
--
ALTER TABLE `videos`
  ADD CONSTRAINT `FK75696octon297ywni28sk19ek` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `watched_videos`
--
ALTER TABLE `watched_videos`
  ADD CONSTRAINT `FKsxdqxct1ki8xo6nv4xv6ktl7l` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `watch_later_videos`
--
ALTER TABLE `watch_later_videos`
  ADD CONSTRAINT `FKsjdexq52tm9t0kmnaine2es94` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `youtube_subscriptions`
--
ALTER TABLE `youtube_subscriptions`
  ADD CONSTRAINT `FKsbafengtpdhcun5ci3gceoesh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
