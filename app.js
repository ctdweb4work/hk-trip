const { useState, useEffect, useMemo, useCallback, useContext, createContext } = React;

const HK_RED = '#BA0C2F';
const HK_RED_DARK = '#8C0823';

// ===== useLocalStorage =====
function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

// ===== Online context =====
const OnlineContext = createContext(null);

function OnlineProvider({ children }) {
  const [forced, setForced] = useLocalStorage('hk-trip:force-offline', false);
  const [navOnline, setNavOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setNavOnline(true);
    const off = () => setNavOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  const value = {
    online: navOnline && !forced,
    forced,
    navOnline,
    toggleForced: () => setForced(!forced),
  };
  return <OnlineContext.Provider value={value}>{children}</OnlineContext.Provider>;
}
const useOnline = () => useContext(OnlineContext);

// ===== Data: Phrasebook =====
const PHRASES = [
  {
    cat: 'Cơ bản',
    items: [
      { vi: 'Xin chào', en: 'Hello', zh: '你好', jy: 'nei5 hou2' },
      { vi: 'Cảm ơn (dịch vụ)', en: 'Thank you (service)', zh: '唔該', jy: 'm4 goi1' },
      { vi: 'Cảm ơn (quà tặng)', en: 'Thank you (gift)', zh: '多謝', jy: 'do1 ze6' },
      { vi: 'Xin lỗi', en: 'Sorry', zh: '對唔住', jy: 'deoi3 m4 zyu6' },
      { vi: 'Làm phiền', en: 'Excuse me', zh: '唔好意思', jy: 'm4 hou2 ji3 si1' },
      { vi: 'Tạm biệt', en: 'Goodbye', zh: '拜拜', jy: 'baai1 baai3' },
      { vi: 'Có', en: 'Yes', zh: '係', jy: 'hai6' },
      { vi: 'Không', en: 'No', zh: '唔係', jy: 'm4 hai6' },
      { vi: 'Tôi không nói được tiếng Quảng', en: "I don't speak Cantonese", zh: '我唔識講廣東話', jy: 'ngo5 m4 sik1 gong2 gwong2 dung1 waa2' },
      { vi: 'Bạn có nói tiếng Anh không?', en: 'Do you speak English?', zh: '你識唔識講英文？', jy: 'nei5 sik1 m4 sik1 gong2 jing1 man2' },
    ],
  },
  {
    cat: 'Taxi & Di chuyển',
    items: [
      { vi: 'Cho tôi đến địa chỉ này', en: 'Take me to this address', zh: '請去呢個地址', jy: 'cing2 heoi3 nei1 go3 dei6 zi2' },
      { vi: 'Đi đến sân bay', en: 'To the airport', zh: '去機場', jy: 'heoi3 gei1 coeng4' },
      { vi: 'Bao xa nữa?', en: 'How far?', zh: '仲有幾遠？', jy: 'zung6 jau5 gei2 jyun5' },
      { vi: 'Dừng ở đây', en: 'Stop here', zh: '喺度停', jy: 'hai2 dou6 ting4' },
      { vi: 'Bao nhiêu tiền?', en: 'How much?', zh: '幾多錢？', jy: 'gei2 do1 cin2' },
      { vi: 'Cho hóa đơn', en: 'Receipt please', zh: '唔該俾張收據', jy: 'm4 goi1 bei2 zoeng1 sau1 geoi3' },
      { vi: 'Trạm MTR gần nhất ở đâu?', en: 'Where is the nearest MTR?', zh: '最近嘅港鐵站喺邊？', jy: 'zeoi3 kan5 ge3 gong2 tit3 zaam6 hai2 bin1' },
      { vi: 'Tôi đi tuyến nào?', en: 'Which line do I take?', zh: '我搭邊條線？', jy: 'ngo5 daap3 bin1 tiu4 sin3' },
    ],
  },
  {
    cat: 'Nhà hàng',
    items: [
      { vi: 'Cho tôi xem menu', en: 'Menu please', zh: '唔該俾個餐牌我', jy: 'm4 goi1 bei2 go3 caan1 paai4 ngo5' },
      { vi: 'Tôi muốn gọi cái này', en: 'I want this', zh: '我要呢個', jy: 'ngo5 jiu3 nei1 go3' },
      { vi: 'Không cay', en: 'Not spicy', zh: '唔要辣', jy: 'm4 jiu3 laat6' },
      { vi: 'Tôi ăn chay', en: "I'm vegetarian", zh: '我食素', jy: 'ngo5 sik6 sou3' },
      { vi: 'Cho thêm nước', en: 'More water please', zh: '唔該加水', jy: 'm4 goi1 gaa1 seoi2' },
      { vi: 'Một bia', en: 'One beer', zh: '一杯啤酒', jy: 'jat1 bui1 be1 zau2' },
      { vi: 'Tính tiền', en: 'Bill please', zh: '唔該埋單', jy: 'm4 goi1 maai4 daan1' },
      { vi: 'Trả bằng thẻ được không?', en: 'Card OK?', zh: '可唔可以碌卡？', jy: 'ho2 m4 ho2 ji5 luk1 kaa1' },
      { vi: 'Ngon quá!', en: 'Delicious!', zh: '好食！', jy: 'hou2 sik6' },
    ],
  },
  {
    cat: 'Mua sắm',
    items: [
      { vi: 'Bao nhiêu tiền?', en: 'How much?', zh: '幾錢呀？', jy: 'gei2 cin2 aa3' },
      { vi: 'Có thể giảm giá không?', en: 'Discount?', zh: '可唔可以平啲？', jy: 'ho2 m4 ho2 ji5 peng4 di1' },
      { vi: 'Đắt quá', en: 'Too expensive', zh: '太貴啦', jy: 'taai3 gwai3 laa1' },
      { vi: 'Tôi chỉ xem thôi', en: 'Just looking', zh: '我睇下', jy: 'ngo5 tai2 haa5' },
      { vi: 'Có size khác không?', en: 'Other size?', zh: '有冇第個碼？', jy: 'jau5 mou5 dai6 go3 maa5' },
      { vi: 'Có màu khác không?', en: 'Other colour?', zh: '有冇第個顏色？', jy: 'jau5 mou5 dai6 go3 ngaan4 sik1' },
      { vi: 'Tôi mua cái này', en: "I'll take this", zh: '我要呢個', jy: 'ngo5 jiu3 nei1 go3' },
      { vi: 'Cho túi giúp', en: 'A bag please', zh: '唔該俾個袋', jy: 'm4 goi1 bei2 go3 doi2' },
    ],
  },
  {
    cat: 'Hỏi đường',
    items: [
      { vi: '___ ở đâu?', en: 'Where is ___?', zh: '___喺邊度？', jy: '___ hai2 bin1 dou6' },
      { vi: 'Đi thẳng', en: 'Go straight', zh: '直行', jy: 'zik6 haang4' },
      { vi: 'Rẽ trái', en: 'Turn left', zh: '轉左', jy: 'zyun2 zo2' },
      { vi: 'Rẽ phải', en: 'Turn right', zh: '轉右', jy: 'zyun2 jau6' },
      { vi: 'Gần đây không?', en: 'Is it nearby?', zh: '近唔近？', jy: 'kan5 m4 kan5' },
      { vi: 'Nhà vệ sinh ở đâu?', en: 'Toilet?', zh: '洗手間喺邊度？', jy: 'sai2 sau2 gaan1 hai2 bin1 dou6' },
      { vi: 'Tôi bị lạc', en: 'I am lost', zh: '我蕩失路', jy: 'ngo5 dong6 sat1 lou6' },
      { vi: 'Chỉ trên bản đồ giúp', en: 'Show me on map', zh: '指俾我睇地圖', jy: 'zi2 bei2 ngo5 tai2 dei6 tou4' },
    ],
  },
  {
    cat: 'Khẩn cấp',
    items: [
      { vi: 'Giúp tôi với!', en: 'Help!', zh: '救命！', jy: 'gau3 meng6' },
      { vi: 'Gọi cảnh sát', en: 'Call police', zh: '叫差人', jy: 'giu3 caai1 jan2' },
      { vi: 'Gọi xe cứu thương', en: 'Call ambulance', zh: '叫白車', jy: 'giu3 baak6 ce1' },
      { vi: 'Tôi bị bệnh', en: 'I am sick', zh: '我病咗', jy: 'ngo5 beng6 zo2' },
      { vi: 'Tôi cần đến bệnh viện', en: 'I need hospital', zh: '我要去醫院', jy: 'ngo5 jiu3 heoi3 ji1 jyun2' },
      { vi: 'Tôi bị dị ứng', en: 'I have an allergy', zh: '我有敏感', jy: 'ngo5 jau5 man5 gam2' },
      { vi: 'Tôi bị mất hộ chiếu', en: 'I lost my passport', zh: '我唔見咗護照', jy: 'ngo5 m4 gin3 zo2 wu6 ziu3' },
      { vi: 'Tôi bị mất điện thoại', en: 'I lost my phone', zh: '我唔見咗電話', jy: 'ngo5 m4 gin3 zo2 din6 waa2' },
    ],
  },
];

// ===== Data: Tips =====
const TIPS = [
  { title: 'Octopus Card (八達通)', body: 'Mua tại MTR Customer Service hoặc 7-Eleven. Đặt cọc HK$50, nạp tối thiểu HK$100. Dùng cho MTR, bus, ferry, tram, taxi (một số), 7-Eleven, nhiều cửa hàng. Trả lại lấy cọc khi về (tại MTR).' },
  { title: 'MTR (Tàu điện ngầm)', body: 'Chạy 5:30 - 1:00 sáng. Đứng bên PHẢI thang cuốn (bên trái dành cho người đi nhanh). KHÔNG ăn uống trong tàu (phạt HK$2000). Tải app "MTR Mobile" để tra đường.' },
  { title: 'Tiền tệ', body: 'HKD = HK$. Mệnh giá 10/20/50/100/500/1000. ATM rộng khắp. Đổi tiền tốt nhất ở Chungking Mansions (Tsim Sha Tsui) hoặc Mong Kok. TRÁNH đổi ở airport — tỷ giá rất tệ.' },
  { title: 'Ổ cắm điện', body: 'Type G — 3 chấu vuông giống UK. Mang adapter từ VN hoặc mua tại 7-Eleven (~HK$30-50). Điện áp 220V — thiết bị VN dùng được trực tiếp.' },
  { title: 'Tipping', body: 'Không bắt buộc. Nhà hàng thường đã tính sẵn 10% service charge — không cần tip thêm. Taxi: làm tròn lên đồng nguyên. Khách sạn: HK$10-20 cho bellboy.' },
  { title: 'WiFi & SIM', body: 'WiFi miễn phí: "Wi-Fi.HK" tại nơi công cộng, MTR, airport. SIM: mua tại airport (3HK / CSL / SmarTone) ~HK$80-150 cho 5-8 ngày data. Hoặc eSIM Airalo đặt trước qua app.' },
  { title: 'Thời tiết tháng 6-7', body: 'NÓNG ẨM 28-32°C, mưa rào nhiều, độ ẩm cao. Bắt buộc mang ô gấp. Áo khoác mỏng cho AC trong nhà (rất lạnh). Mùa bão (typhoon) — theo dõi tin HKO, T8 trở lên thì mọi thứ đóng cửa.' },
  { title: 'Visa & Nhập cảnh', body: 'Hộ chiếu VN CẦN visa cho HK (kiểm tra lại tại lãnh sự quán TQ trước khi đi). Hộ chiếu phải còn hạn ≥6 tháng. Khai báo hải quan nếu mang trên HK$120,000 tiền mặt.' },
  { title: 'Nước uống', body: 'Nước máy HK đạt chuẩn uống được, nhưng người dân thường đun sôi. An toàn nhất: mua nước đóng chai (~HK$5-10/chai tại 7-Eleven).' },
  { title: 'Mua sắm', body: 'Mall lớn: IFC, Pacific Place, Harbour City, K11 Musea. Chợ: Ladies Market (Mong Kok), Temple Street Night Market, Stanley Market. Outlet: Citygate (Tung Chung). TRẢ GIÁ ở chợ, KHÔNG trả giá trong mall.' },
  { title: 'Đồ ăn nên thử', body: 'Dimsum (điểm tâm), vịt quay BBQ, mì wonton, cha siu, egg tart (Tai Cheong / Honolulu), milk tea Hong Kong, French toast, congee. Thử ở quán cha chaan teng (茶餐廳).' },
  { title: 'An toàn', body: 'HK rất an toàn. Hạn chế móc túi tại chợ đêm và MTR giờ cao điểm. Luôn có hộ chiếu/bản chụp. Ban đêm tại Mong Kok / Wan Chai vẫn an toàn nhưng cẩn thận đám đông.' },
];

// ===== Data: Emergency =====
const EMERGENCY = [
  { label: 'Cảnh sát / Cứu hỏa / Cấp cứu', value: '999', tel: '999', highlight: true },
  { label: 'TLSQ Việt Nam tại HK', value: '+852 2591 4517', tel: '+85225914517', note: '15/F, Great Smart Tower, 230 Wan Chai Road, Wan Chai' },
  { label: 'TLSQ VN — đường dây nóng', value: '+852 9039 9347', tel: '+85290399347', note: 'Bảo hộ công dân khẩn cấp 24/7' },
  { label: 'Hospital Authority hotline', value: '+852 2300 6555', tel: '+85223006555' },
  { label: 'MTR Hotline', value: '+852 2881 8888', tel: '+85228818888' },
  { label: 'HK Tourism Board', value: '+852 2508 1234', tel: '+85225081234' },
];

// ===== Sample places =====
const SAMPLE_PLACES = [
  { name: 'Victoria Peak', zh: '太平山頂', addr: '128 Peak Road', mtr: 'Central → Peak Tram' },
  { name: 'Tsim Sha Tsui Promenade', zh: '尖沙咀海濱花園', addr: 'Salisbury Road, TST', mtr: 'Tsim Sha Tsui' },
  { name: 'Ladies Market', zh: '女人街', addr: 'Tung Choi Street, Mong Kok', mtr: 'Mong Kok' },
  { name: 'Hong Kong Disneyland', zh: '香港迪士尼樂園', addr: 'Lantau Island', mtr: 'Disneyland Resort' },
];

// ===== Default checklist =====
const DEFAULT_CHECKLIST = [
  { cat: 'Giấy tờ', items: [
    'Hộ chiếu (còn ≥6 tháng)',
    'Visa Hồng Kông',
    'Vé máy bay (in giấy + lưu điện thoại)',
    'Bảo hiểm du lịch',
    'Booking khách sạn (in giấy + email)',
    '2 ảnh thẻ 4x6 dự phòng',
  ]},
  { cat: 'Tiền & Thẻ', items: [
    'HKD tiền mặt',
    'Thẻ Visa/Master (báo ngân hàng đi nước ngoài)',
    'Tiền VND dự phòng',
    'Thẻ tín dụng dự phòng',
  ]},
  { cat: 'Điện tử', items: [
    'Điện thoại + cáp sạc',
    'Adapter ổ cắm Type G',
    'Pin dự phòng (≤100Wh, ký gửi không được)',
    'Tai nghe',
    'Máy ảnh + thẻ nhớ',
    'eSIM/SIM HK đã đặt',
  ]},
  { cat: 'Quần áo', items: [
    'Trang phục theo thời tiết (5-7 bộ)',
    'Áo khoác mỏng (AC trong nhà lạnh)',
    'Ô gấp',
    'Giày đi bộ thoải mái',
    'Dép trong khách sạn',
    'Đồ bơi (nếu khách sạn có hồ)',
  ]},
  { cat: 'Sức khỏe', items: [
    'Thuốc cá nhân (kê toa + đơn thuốc tiếng Anh)',
    'Paracetamol / thuốc cảm',
    'Men tiêu hóa / Smecta',
    'Khẩu trang',
    'Băng cá nhân',
    'Kem chống nắng',
    'Xịt côn trùng',
  ]},
  { cat: 'Khác', items: [
    'Bàn chải + đồ vệ sinh cá nhân',
    'Kính mát',
    'Túi đeo chéo chống trộm',
    'Sổ ghi chú + bút',
    'Túi đựng đồ bẩn',
  ]},
];

// ===== Weather codes =====
const WEATHER_CODES = {
  0: ['☀️', 'Nắng'],
  1: ['🌤️', 'Phần lớn nắng'],
  2: ['⛅', 'Có mây'],
  3: ['☁️', 'Nhiều mây'],
  45: ['🌫️', 'Sương mù'],
  48: ['🌫️', 'Sương mù'],
  51: ['🌦️', 'Mưa phùn nhẹ'],
  53: ['🌦️', 'Mưa phùn'],
  55: ['🌦️', 'Mưa phùn nặng'],
  61: ['🌧️', 'Mưa nhẹ'],
  63: ['🌧️', 'Mưa'],
  65: ['🌧️', 'Mưa nặng'],
  80: ['🌦️', 'Mưa rào nhẹ'],
  81: ['🌦️', 'Mưa rào'],
  82: ['⛈️', 'Mưa rào lớn'],
  95: ['⛈️', 'Giông bão'],
  96: ['⛈️', 'Giông + mưa đá'],
  99: ['⛈️', 'Giông + mưa đá lớn'],
};
const weatherCode = (c) => WEATHER_CODES[c] || ['🌡️', `Mã ${c}`];

// ===== UI Components =====
function ConnectionBadge() {
  const { online, forced, navOnline, toggleForced } = useOnline();
  let label, cls;
  if (forced) {
    label = '📵 Tự offline';
    cls = 'bg-slate-100 text-slate-600 border-slate-300';
  } else if (!navOnline) {
    label = '🔴 Mất mạng';
    cls = 'bg-red-50 text-red-700 border-red-200';
  } else {
    label = '🟢 Online';
    cls = 'bg-green-50 text-green-700 border-green-200';
  }
  return (
    <button onClick={toggleForced} title="Bấm để chuyển chế độ online/offline"
      className={`no-tap text-xs font-medium rounded-full px-2.5 py-1 border ${cls}`}>
      {label}
    </button>
  );
}

function Header({ title }) {
  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-2">
      <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
      <ConnectionBadge />
    </header>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button {...props}
      style={{ backgroundColor: HK_RED, ...(props.style || {}) }}
      className={`no-tap text-white rounded font-medium disabled:opacity-50 ${props.className || ''}`}>
      {children}
    </button>
  );
}

function PhraseCard({ item, pinned, onPin }) {
  return (
    <div className="bg-white rounded-lg p-3 mb-2 border border-slate-200 border-l-4 shadow-sm" style={{ borderLeftColor: HK_RED }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-slate-900 font-medium">{item.vi}</div>
          <div className="text-slate-500 text-sm">{item.en}</div>
          <div className="text-2xl mt-2 font-bold leading-tight" style={{ color: HK_RED }}>{item.zh}</div>
          <div className="text-slate-600 text-sm italic mt-1">{item.jy}</div>
        </div>
        <button onClick={onPin} className="no-tap text-2xl shrink-0 leading-none">
          {pinned ? '⭐' : '☆'}
        </button>
      </div>
    </div>
  );
}

function PhrasebookView() {
  const [openCat, setOpenCat] = useState('Cơ bản');
  const [pinned, setPinned] = useLocalStorage('hk-trip:pinned', []);
  const isPinned = (item) => pinned.some(p => p.zh === item.zh);
  const togglePin = (item) => {
    setPinned(prev => prev.some(p => p.zh === item.zh)
      ? prev.filter(p => p.zh !== item.zh)
      : [...prev, item]);
  };

  return (
    <div className="pb-24">
      <Header title="💬 Câu nói tiếng Quảng" />
      <div className="p-3">
        {pinned.length > 0 && (
          <div className="mb-4">
            <div className="text-xs uppercase mb-2 px-1 font-semibold" style={{ color: HK_RED }}>⭐ Đã ghim</div>
            {pinned.map((item, i) => (
              <PhraseCard key={'p' + i} item={item} pinned={true} onPin={() => togglePin(item)} />
            ))}
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-3 px-3">
          {PHRASES.map(c => (
            <button
              key={c.cat}
              onClick={() => setOpenCat(c.cat)}
              style={openCat === c.cat ? { backgroundColor: HK_RED } : {}}
              className={`no-tap shrink-0 px-3 py-1.5 rounded-full text-sm font-medium ${
                openCat === c.cat ? 'text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >{c.cat}</button>
          ))}
        </div>
        {PHRASES.find(c => c.cat === openCat)?.items.map((item, i) => (
          <PhraseCard key={i} item={item} pinned={isPinned(item)} onPin={() => togglePin(item)} />
        ))}
      </div>
    </div>
  );
}

function SubTabs({ value, onChange, tabs }) {
  return (
    <div className="flex gap-2 mb-3">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={value === t.id ? { backgroundColor: HK_RED } : {}}
          className={`no-tap flex-1 py-2 rounded font-medium ${value === t.id ? 'text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ItinerarySection() {
  const [items, setItems] = useLocalStorage('hk-trip:itinerary', []);
  const [newDate, setNewDate] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');

  const add = () => {
    if (!newDate || !newTitle.trim()) return;
    setItems([...items, { id: Date.now(), date: newDate, title: newTitle.trim(), note: newNote.trim(), done: false }]);
    setNewTitle(''); setNewNote('');
  };
  const toggle = (id) => setItems(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const remove = (id) => setItems(items.filter(it => it.id !== id));

  const grouped = useMemo(() => {
    const m = {};
    items.forEach(it => { (m[it.date] = m[it.date] || []).push(it); });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const inputCls = 'w-full bg-slate-50 border border-slate-300 text-slate-900 rounded px-2 py-2 mb-2 outline-none';

  return (
    <>
      <div className="bg-white rounded-lg p-3 mb-4 border border-slate-200 shadow-sm">
        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={inputCls} />
        <input placeholder="Hoạt động (vd: Victoria Peak)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className={inputCls} />
        <input placeholder="Ghi chú (vd: 14:00, đi Peak Tram)" value={newNote} onChange={e => setNewNote(e.target.value)} className={inputCls} />
        <PrimaryButton onClick={add} className="w-full py-2">+ Thêm</PrimaryButton>
      </div>
      {grouped.length === 0 && <div className="text-slate-500 text-center py-8">Chưa có lịch trình.</div>}
      {grouped.map(([date, its]) => (
        <div key={date} className="mb-4">
          <div className="text-sm font-semibold mb-2 px-1" style={{ color: HK_RED }}>📅 {date}</div>
          {its.map(it => (
            <div key={it.id} className="bg-white rounded-lg p-3 mb-2 border border-slate-200 flex items-start gap-2 shadow-sm">
              <button onClick={() => toggle(it.id)} className="no-tap text-xl shrink-0 mt-0.5 leading-none">
                {it.done ? '✅' : '⬜'}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${it.done ? 'line-through text-slate-400' : 'text-slate-900'}`}>{it.title}</div>
                {it.note && <div className="text-sm text-slate-500 mt-0.5">{it.note}</div>}
              </div>
              <button onClick={() => remove(it.id)} className="no-tap text-slate-400 shrink-0 px-1">✕</button>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function compressImage(file, maxWidth = 1024, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Đọc file lỗi'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Ảnh hỏng'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function NotesSection() {
  const [notes, setNotes] = useLocalStorage('hk-trip:notes', []);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [viewer, setViewer] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const compressed = await compressImage(f);
      setPhoto(compressed);
    } catch (err) {
      alert('Lỗi xử lý ảnh: ' + err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const add = () => {
    if (!text.trim() && !photo) return;
    setNotes([{ id: Date.now(), date, text: text.trim(), photo, createdAt: new Date().toISOString() }, ...notes]);
    setText(''); setPhoto(null);
  };
  const remove = (id) => {
    if (confirm('Xóa ghi chép này?')) setNotes(notes.filter(n => n.id !== id));
  };

  const grouped = useMemo(() => {
    const m = {};
    notes.forEach(n => { (m[n.date] = m[n.date] || []).push(n); });
    return Object.entries(m).sort(([a], [b]) => b.localeCompare(a));
  }, [notes]);

  const inputCls = 'w-full bg-slate-50 border border-slate-300 text-slate-900 rounded px-2 py-2 outline-none';

  return (
    <>
      <div className="bg-white rounded-lg p-3 mb-4 border border-slate-200 shadow-sm">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls + ' mb-2'} />
        <textarea placeholder="Hôm nay đi đâu, ăn gì, gặp ai..." value={text} onChange={e => setText(e.target.value)}
          rows={4} className={inputCls + ' mb-2 resize-none'} />
        {photo && (
          <div className="relative mb-2">
            <img src={photo} className="w-full rounded border border-slate-200" alt="" />
            <button onClick={() => setPhoto(null)}
              className="no-tap absolute top-1 right-1 bg-white/95 rounded-full w-7 h-7 text-sm font-bold shadow flex items-center justify-center">✕</button>
          </div>
        )}
        <div className="flex gap-2">
          <label className={`no-tap flex-1 cursor-pointer bg-slate-100 border border-slate-300 text-slate-700 rounded py-2 text-center font-medium ${busy ? 'opacity-50' : ''}`}>
            📷 {busy ? 'Đang xử lý…' : photo ? 'Đổi ảnh' : 'Thêm ảnh'}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" disabled={busy} />
          </label>
          <PrimaryButton onClick={add} className="flex-1 py-2">+ Lưu</PrimaryButton>
        </div>
      </div>
      {grouped.length === 0 && <div className="text-slate-500 text-center py-8">Chưa có nhật ký nào.<br/><span className="text-xs">Ghi lại khoảnh khắc đầu tiên ở trên ☝️</span></div>}
      {grouped.map(([d, ns]) => (
        <div key={d} className="mb-4">
          <div className="text-sm font-semibold mb-2 px-1" style={{ color: HK_RED }}>📔 {d}</div>
          {ns.map(n => (
            <div key={n.id} className="bg-white rounded-lg p-3 mb-2 border border-slate-200 shadow-sm">
              {n.photo && (
                <img src={n.photo} className="w-full rounded mb-2 cursor-pointer" alt=""
                  onClick={() => setViewer(n.photo)} />
              )}
              {n.text && <div className="text-slate-900 whitespace-pre-wrap text-sm leading-relaxed">{n.text}</div>}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button onClick={() => remove(n.id)} className="no-tap text-slate-400 px-2 text-xs">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      ))}
      {viewer && (
        <div onClick={() => setViewer(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 no-tap">
          <img src={viewer} className="max-w-full max-h-full rounded" alt="" />
          <button onClick={() => setViewer(null)}
            className="no-tap absolute top-4 right-4 bg-white/95 rounded-full w-10 h-10 font-bold flex items-center justify-center shadow">✕</button>
        </div>
      )}
    </>
  );
}

function PlanView() {
  const [sub, setSub] = useState('plan');
  return (
    <div className="pb-24">
      <Header title="📅 Lịch & Nhật ký" />
      <div className="px-3 pt-3">
        <SubTabs value={sub} onChange={setSub} tabs={[
          { id: 'plan', label: 'Lịch trình' },
          { id: 'notes', label: 'Nhật ký' },
        ]} />
        {sub === 'plan' && <ItinerarySection />}
        {sub === 'notes' && <NotesSection />}
      </div>
    </div>
  );
}

const CATEGORIES = ['Ăn uống', 'Di chuyển', 'Lưu trú', 'Tham quan', 'Mua sắm', 'Khác'];

function GiftsSection({ rate }) {
  const [gifts, setGifts] = useLocalStorage('hk-trip:gifts', []);
  const [recipient, setRecipient] = useState('');
  const [item, setItem] = useState('');
  const [budget, setBudget] = useState('');
  const [note, setNote] = useState('');

  const add = () => {
    if (!recipient.trim() || !item.trim()) return;
    setGifts([{
      id: Date.now(),
      recipient: recipient.trim(),
      item: item.trim(),
      budget: parseFloat(budget) || 0,
      note: note.trim(),
      bought: false,
    }, ...gifts]);
    setItem(''); setBudget(''); setNote('');
  };
  const toggle = (id) => setGifts(gifts.map(g => g.id === id ? { ...g, bought: !g.bought } : g));
  const remove = (id) => setGifts(gifts.filter(g => g.id !== id));

  const byRecipient = useMemo(() => {
    const m = {};
    gifts.forEach(g => { (m[g.recipient] = m[g.recipient] || []).push(g); });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [gifts]);

  const totalBudget = gifts.reduce((s, g) => s + (g.budget || 0), 0);
  const totalBought = gifts.filter(g => g.bought).reduce((s, g) => s + (g.budget || 0), 0);

  const inputCls = 'w-full bg-slate-50 border border-slate-300 text-slate-900 rounded px-2 py-2 mb-2 outline-none';

  return (
    <>
      <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200 shadow-sm">
        <input placeholder="Người nhận (vd: Mẹ)" value={recipient} onChange={e => setRecipient(e.target.value)} className={inputCls} />
        <input placeholder="Quà (vd: Trà sữa hộp)" value={item} onChange={e => setItem(e.target.value)} className={inputCls} />
        <input type="number" inputMode="decimal" placeholder="Ngân sách HK$" value={budget} onChange={e => setBudget(e.target.value)} className={inputCls} />
        {budget && parseFloat(budget) > 0 && (
          <div className="text-xs mb-2" style={{ color: HK_RED }}>≈ {Math.round(parseFloat(budget) * rate).toLocaleString('vi-VN')}đ</div>
        )}
        <input placeholder="Ghi chú (vd: mua ở K11 Musea)" value={note} onChange={e => setNote(e.target.value)} className={inputCls} />
        <PrimaryButton onClick={add} className="w-full py-2">+ Thêm quà</PrimaryButton>
      </div>

      {gifts.length > 0 && (
        <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Đã mua</span>
            <span className="font-mono text-slate-900">HK${totalBought.toFixed(2)} / HK${totalBudget.toFixed(2)}</span>
          </div>
          <div className="text-xs text-slate-500 mb-2">
            ≈ {Math.round(totalBought * rate).toLocaleString('vi-VN')}đ / {Math.round(totalBudget * rate).toLocaleString('vi-VN')}đ
          </div>
          <div className="bg-slate-200 h-2 rounded overflow-hidden">
            <div className="h-2 transition-all" style={{ width: `${totalBudget ? (totalBought / totalBudget) * 100 : 0}%`, backgroundColor: HK_RED }} />
          </div>
        </div>
      )}

      {byRecipient.length === 0 && <div className="text-slate-500 text-center py-8">Chưa có quà nào.<br/><span className="text-xs">Lên kế hoạch mua quà cho ai đó ở trên ☝️</span></div>}

      {byRecipient.map(([who, items]) => {
        const sub = items.reduce((s, g) => s + (g.budget || 0), 0);
        return (
          <div key={who} className="mb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-sm font-semibold" style={{ color: HK_RED }}>🎁 {who}</div>
              <div className="text-xs text-slate-500 font-mono">HK${sub.toFixed(2)}</div>
            </div>
            {items.map(g => (
              <div key={g.id} className="bg-white rounded-lg p-3 mb-2 border border-slate-200 flex items-start gap-2 shadow-sm">
                <button onClick={() => toggle(g.id)} className="no-tap text-xl shrink-0 mt-0.5 leading-none">
                  {g.bought ? '✅' : '⬜'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${g.bought ? 'line-through text-slate-400' : 'text-slate-900'}`}>{g.item}</div>
                  {g.budget > 0 && (
                    <div className="text-sm text-slate-500">
                      HK${g.budget.toFixed(2)} <span className="text-slate-400">(≈ {Math.round(g.budget * rate).toLocaleString('vi-VN')}đ)</span>
                    </div>
                  )}
                  {g.note && <div className="text-xs text-slate-500 mt-0.5">{g.note}</div>}
                </div>
                <button onClick={() => remove(g.id)} className="no-tap text-slate-400 shrink-0 px-1">✕</button>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

function MoneyView() {
  const [sub, setSub] = useState('expenses');
  const [rate, setRate] = useLocalStorage('hk-trip:rate', 3200);
  const [rateUpdated, setRateUpdated] = useLocalStorage('hk-trip:rate-updated', null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);
  const [expenses, setExpenses] = useLocalStorage('hk-trip:expenses', []);
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('Ăn uống');
  const [note, setNote] = useState('');
  const { online } = useOnline();

  const fetchRate = async () => {
    if (!online) { setRateError('Đang offline, không thể tải tỷ giá'); return; }
    setRateLoading(true); setRateError(null);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/HKD');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      if (json.result === 'success' && json.rates?.VND) {
        setRate(Math.round(json.rates.VND));
        setRateUpdated(new Date().toISOString());
      } else {
        throw new Error('Không có VND trong dữ liệu');
      }
    } catch (e) {
      setRateError(e.message);
    } finally {
      setRateLoading(false);
    }
  };

  const add = () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    const today = new Date().toISOString().split('T')[0];
    setExpenses([{ id: Date.now(), amount: a, cat, note: note.trim(), date: today }, ...expenses]);
    setAmount(''); setNote('');
  };
  const remove = (id) => setExpenses(expenses.filter(e => e.id !== id));

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const byDate = useMemo(() => {
    const m = {};
    expenses.forEach(e => { m[e.date] = (m[e.date] || 0) + e.amount; });
    return Object.entries(m).sort(([a], [b]) => b.localeCompare(a));
  }, [expenses]);
  const byCat = useMemo(() => {
    const m = {};
    expenses.forEach(e => { m[e.cat] = (m[e.cat] || 0) + e.amount; });
    return Object.entries(m).sort(([, a], [, b]) => b - a);
  }, [expenses]);

  const [convHKD, setConvHKD] = useState('');
  const [convVND, setConvVND] = useState('');
  const onHKD = (v) => {
    setConvHKD(v);
    const n = parseFloat(v);
    setConvVND(!isNaN(n) ? Math.round(n * rate).toLocaleString('vi-VN') : '');
  };
  const onVND = (v) => {
    setConvVND(v);
    const num = parseFloat(v.replace(/[^0-9]/g, ''));
    setConvHKD(!isNaN(num) && num > 0 ? (num / rate).toFixed(2) : '');
  };

  const inputCls = 'w-full bg-slate-50 border border-slate-300 text-slate-900 rounded px-2 py-2 outline-none';

  return (
    <div className="pb-24">
      <Header title="💵 Chi tiêu" />
      <div className="px-3 pt-3">
        <SubTabs value={sub} onChange={setSub} tabs={[
          { id: 'expenses', label: 'Sổ chi' },
          { id: 'convert', label: 'Quy đổi' },
          { id: 'gifts', label: 'Quà' },
        ]} />

        {sub === 'gifts' && <GiftsSection rate={rate} />}

        {sub === 'expenses' && (
          <>
            <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200 shadow-sm">
              <div className="flex gap-2 mb-2">
                <input type="number" inputMode="decimal" placeholder="HK$" value={amount} onChange={e => setAmount(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-lg font-bold rounded px-2 py-2 outline-none" />
                <select value={cat} onChange={e => setCat(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 rounded px-2 py-2 outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input placeholder="Ghi chú (vd: dim sum tại Tim Ho Wan)" value={note} onChange={e => setNote(e.target.value)}
                className={inputCls + ' mb-2'} />
              {amount && parseFloat(amount) > 0 && (
                <div className="text-sm font-medium mb-2" style={{ color: HK_RED }}>
                  ≈ {Math.round(parseFloat(amount) * rate).toLocaleString('vi-VN')} VND
                </div>
              )}
              <PrimaryButton onClick={add} className="w-full py-2">+ Thêm khoản chi</PrimaryButton>
            </div>

            <div className="rounded-lg p-4 mb-3 text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${HK_RED}, ${HK_RED_DARK})` }}>
              <div className="text-white/90 text-sm">Tổng chi cả chuyến</div>
              <div className="text-3xl font-bold">HK${total.toFixed(2)}</div>
              <div className="text-white/90">≈ {Math.round(total * rate).toLocaleString('vi-VN')} VND</div>
            </div>

            {byCat.length > 0 && (
              <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-600 mb-2 font-semibold">Theo loại</div>
                {byCat.map(([c, s]) => (
                  <div key={c} className="flex justify-between text-slate-900 py-1 text-sm">
                    <span>{c}</span>
                    <span className="font-mono">HK${s.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {byDate.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-slate-600 mb-2 px-1 font-semibold">Theo ngày</div>
                {byDate.map(([d, s]) => (
                  <div key={d}>
                    <div className="text-xs font-semibold mb-1 mt-3 px-1" style={{ color: HK_RED }}>{d} — HK${s.toFixed(2)}</div>
                    {expenses.filter(e => e.date === d).map(e => (
                      <div key={e.id} className="bg-white border border-slate-200 rounded p-2 mb-1 flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-900 text-sm truncate">{e.cat}{e.note && <span className="text-slate-500"> — {e.note}</span>}</div>
                        </div>
                        <div className="text-slate-900 font-mono shrink-0 text-sm">HK${e.amount.toFixed(2)}</div>
                        <button onClick={() => remove(e.id)} className="no-tap text-slate-400 shrink-0 px-1">✕</button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {sub === 'convert' && (
          <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <label className="text-sm text-slate-600">HKD (HK$)</label>
            <input type="number" inputMode="decimal" value={convHKD} onChange={e => onHKD(e.target.value)}
              placeholder="0" className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-2xl font-bold rounded px-3 py-3 mb-3 outline-none" />
            <label className="text-sm text-slate-600">VND (₫)</label>
            <input type="text" inputMode="numeric" value={convVND} onChange={e => onVND(e.target.value)}
              placeholder="0" className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-2xl font-bold rounded px-3 py-3 mb-4 outline-none" />

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-end gap-2 mb-2">
                <div className="flex-1">
                  <label className="text-sm text-slate-600">Tỷ giá (1 HKD = ? VND)</label>
                  <input type="number" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded px-3 py-2 outline-none" />
                </div>
                <PrimaryButton onClick={fetchRate} disabled={rateLoading || !online} className="px-3 py-2 text-sm whitespace-nowrap">
                  {rateLoading ? '...' : '🔄 Cập nhật'}
                </PrimaryButton>
              </div>
              {rateError && <div className="text-red-600 text-xs">{rateError}</div>}
              {rateUpdated && <div className="text-slate-500 text-xs">Cập nhật lần cuối: {new Date(rateUpdated).toLocaleString('vi-VN')}</div>}
              {!online && <div className="text-slate-500 text-xs mt-1">Đang offline — không thể cập nhật tỷ giá.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistView() {
  const [checks, setChecks] = useLocalStorage('hk-trip:checks', {});
  const [custom, setCustomRaw] = useLocalStorage('hk-trip:custom-checks', []);
  const [newItem, setNewItem] = useState('');

  // Migrate old format [string] → [{id, text}]
  const customNorm = useMemo(() => {
    return custom.map(c => typeof c === 'string' ? { id: Math.floor(Math.random() * 1e12), text: c } : c);
  }, [custom]);

  const setCustom = (next) => setCustomRaw(next);

  const toggle = (key) => setChecks({ ...checks, [key]: !checks[key] });
  const addCustom = () => {
    const t = newItem.trim();
    if (!t) return;
    setCustom([{ id: Date.now(), text: t }, ...customNorm]);
    setNewItem('');
  };
  const removeCustom = (id) => {
    const item = customNorm.find(c => c.id === id);
    setCustom(customNorm.filter(c => c.id !== id));
    if (item) {
      const key = `Tự nhập::${item.text}`;
      if (key in checks) {
        const c = { ...checks };
        delete c[key];
        setChecks(c);
      }
    }
  };

  const allCats = [
    { cat: 'Tự nhập', items: customNorm.map(c => c.text) },
    ...DEFAULT_CHECKLIST,
  ];
  const total = allCats.reduce((s, c) => s + c.items.length, 0);
  const done = allCats.reduce((s, c) => s + c.items.filter(i => checks[`${c.cat}::${i}`]).length, 0);

  return (
    <div className="pb-24">
      <Header title="✓ Checklist" />
      <div className="p-3">
        <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200 shadow-sm">
          <div className="text-slate-600 text-sm">Tiến độ chuẩn bị</div>
          <div className="text-2xl font-bold text-slate-900">{done}/{total}</div>
          <div className="bg-slate-200 h-2 rounded mt-2 overflow-hidden">
            <div className="h-2 transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%`, backgroundColor: HK_RED }} />
          </div>
        </div>

        {/* Custom section — prominent at top */}
        <div className="bg-white rounded-lg p-3 mb-4 border-2 shadow-sm" style={{ borderColor: HK_RED }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎒</span>
            <div className="font-bold text-slate-900 flex-1">Đồ mang theo (tự nhập)</div>
            <div className="text-xs text-slate-500">{customNorm.length} món</div>
          </div>
          <div className="flex gap-2 mb-3">
            <input placeholder="vd: Sạc dự phòng Anker 20K" value={newItem} onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded px-2 py-2 outline-none" />
            <PrimaryButton onClick={addCustom} className="px-4">+ Thêm</PrimaryButton>
          </div>
          {customNorm.length === 0 && (
            <div className="text-slate-400 text-sm text-center py-4 border-t border-slate-100">
              Chưa có món nào. Gõ ở trên và bấm <b style={{ color: HK_RED }}>+ Thêm</b>.
            </div>
          )}
          {customNorm.map(c => {
            const key = `Tự nhập::${c.text}`;
            return (
              <div key={c.id} className="border-t border-slate-100 py-2 flex items-center gap-2">
                <button onClick={() => toggle(key)} className="no-tap text-xl leading-none shrink-0">
                  {checks[key] ? '✅' : '⬜'}
                </button>
                <button onClick={() => toggle(key)} className={`no-tap flex-1 text-left ${checks[key] ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {c.text}
                </button>
                <button onClick={() => removeCustom(c.id)} className="no-tap text-slate-400 shrink-0 px-1">✕</button>
              </div>
            );
          })}
        </div>

        {/* Default groups */}
        {DEFAULT_CHECKLIST.map(group => (
          <div key={group.cat} className="mb-4">
            <div className="text-sm font-semibold mb-2 px-1" style={{ color: HK_RED }}>{group.cat}</div>
            {group.items.map((item) => {
              const key = `${group.cat}::${item}`;
              return (
                <div key={key} className="bg-white rounded-lg p-3 mb-1 border border-slate-200 flex items-center gap-3 shadow-sm">
                  <button onClick={() => toggle(key)} className="no-tap text-xl shrink-0 leading-none">
                    {checks[key] ? '✅' : '⬜'}
                  </button>
                  <button onClick={() => toggle(key)} className={`no-tap flex-1 text-left ${checks[key] ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeatherSection() {
  const { online } = useOnline();
  const [data, setData] = useLocalStorage('hk-trip:weather', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    if (!online) { setError('Đang offline'); return; }
    setLoading(true); setError(null);
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=22.32&longitude=114.17&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FHong_Kong&forecast_days=5';
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      setData({ current: json.current, daily: json.daily, fetchedAt: new Date().toISOString() });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [online, setData]);

  useEffect(() => {
    if (online && !data) fetchWeather();
  }, []);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-sm font-bold" style={{ color: HK_RED }}>🌤️ Thời tiết Hồng Kông</div>
        <button onClick={fetchWeather} disabled={loading || !online}
          className="no-tap text-xs bg-white border border-slate-300 text-slate-700 rounded-full px-3 py-1 disabled:opacity-40">
          {loading ? 'Đang tải…' : '🔄 Cập nhật'}
        </button>
      </div>
      {!data && !loading && !error && (
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-slate-500 text-sm shadow-sm">
          {online ? 'Bấm "Cập nhật" để tải.' : 'Đang offline — kết nối mạng để tải.'}
        </div>
      )}
      {error && <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-red-700 text-sm">Lỗi: {error}</div>}
      {data && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4" style={{ background: `linear-gradient(135deg, #FCE7EB, #ffffff)` }}>
            <div className="flex items-center gap-3">
              <div className="text-5xl">{weatherCode(data.current.weather_code)[0]}</div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-slate-900">{Math.round(data.current.temperature_2m)}°C</div>
                <div className="text-sm text-slate-700">{weatherCode(data.current.weather_code)[1]}</div>
                <div className="text-xs text-slate-500">
                  Độ ẩm {data.current.relative_humidity_2m}% · Gió {Math.round(data.current.wind_speed_10m)} km/h
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 grid grid-cols-5">
            {data.daily.time.map((d, i) => (
              <div key={d} className="text-center py-2 px-1">
                <div className="text-xs text-slate-500">{new Date(d).toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                <div className="text-xl">{weatherCode(data.daily.weather_code[i])[0]}</div>
                <div className="text-xs text-slate-900 font-medium">{Math.round(data.daily.temperature_2m_max[i])}°</div>
                <div className="text-xs text-slate-400">{Math.round(data.daily.temperature_2m_min[i])}°</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 px-3 py-2 border-t border-slate-100">
            Cập nhật: {new Date(data.fetchedAt).toLocaleString('vi-VN')}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoView() {
  const [places, setPlaces] = useLocalStorage('hk-trip:places', SAMPLE_PLACES);
  const [newPlace, setNewPlace] = useState({ name: '', zh: '', addr: '', mtr: '' });
  const [showAdd, setShowAdd] = useState(false);

  const addPlace = () => {
    if (!newPlace.name.trim()) return;
    setPlaces([...places, { ...newPlace }]);
    setNewPlace({ name: '', zh: '', addr: '', mtr: '' });
    setShowAdd(false);
  };
  const removePlace = (i) => setPlaces(places.filter((_, idx) => idx !== i));

  const inputCls = 'w-full bg-slate-50 border border-slate-300 text-slate-900 rounded px-2 py-2 mb-2 outline-none';

  return (
    <div className="pb-24">
      <Header title="ℹ️ Thông tin" />
      <div className="p-3">
        <WeatherSection />

        <div className="text-sm font-bold mb-2 px-1" style={{ color: HK_RED }}>🆘 Khẩn cấp</div>
        {EMERGENCY.map((e, i) => (
          <a key={i} href={`tel:${e.tel}`}
            className="block rounded-lg p-3 mb-2 no-tap bg-white border shadow-sm"
            style={e.highlight ? { borderColor: HK_RED, borderWidth: 2 } : { borderColor: '#e2e8f0' }}>
            <div className="text-slate-900 font-medium">{e.label}</div>
            <div className="font-mono text-lg font-bold" style={{ color: HK_RED }}>{e.value}</div>
            {e.note && <div className="text-slate-500 text-sm mt-1">{e.note}</div>}
          </a>
        ))}

        <div className="flex items-center justify-between mt-5 mb-2 px-1">
          <div className="text-sm font-bold" style={{ color: HK_RED }}>📍 Địa điểm đã lưu</div>
          <button onClick={() => setShowAdd(!showAdd)}
            style={{ backgroundColor: HK_RED }}
            className="no-tap text-xs text-white rounded px-2 py-1 font-medium">
            {showAdd ? 'Đóng' : '+ Thêm'}
          </button>
        </div>

        {showAdd && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200 shadow-sm">
            <input placeholder="Tên (vd: Victoria Peak)" value={newPlace.name} onChange={e => setNewPlace({ ...newPlace, name: e.target.value })} className={inputCls} />
            <input placeholder="Tên tiếng Hoa (show tài xế)" value={newPlace.zh} onChange={e => setNewPlace({ ...newPlace, zh: e.target.value })} className={inputCls} />
            <input placeholder="Địa chỉ đầy đủ" value={newPlace.addr} onChange={e => setNewPlace({ ...newPlace, addr: e.target.value })} className={inputCls} />
            <input placeholder="MTR gần nhất" value={newPlace.mtr} onChange={e => setNewPlace({ ...newPlace, mtr: e.target.value })} className={inputCls} />
            <PrimaryButton onClick={addPlace} className="w-full py-2">Lưu</PrimaryButton>
          </div>
        )}

        {places.map((p, i) => (
          <div key={i} className="bg-white rounded-lg p-3 mb-2 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 font-medium">{p.name}</div>
                {p.zh && <div className="text-lg font-bold" style={{ color: HK_RED }}>{p.zh}</div>}
                {p.addr && <div className="text-slate-600 text-sm mt-1">{p.addr}</div>}
                {p.mtr && <div className="text-slate-500 text-xs mt-1">🚇 {p.mtr}</div>}
              </div>
              <button onClick={() => removePlace(i)} className="no-tap text-slate-400 shrink-0 px-1">✕</button>
            </div>
          </div>
        ))}

        <div className="text-sm font-bold mb-2 px-1 mt-5" style={{ color: HK_RED }}>💡 Mẹo nhanh</div>
        {TIPS.map((t, i) => (
          <details key={i} className="bg-white rounded-lg p-3 mb-2 border border-slate-200 shadow-sm">
            <summary className="text-slate-900 font-medium cursor-pointer no-tap">{t.title}</summary>
            <div className="text-slate-700 text-sm mt-2 leading-relaxed">{t.body}</div>
          </details>
        ))}

        <div className="text-center text-slate-400 text-xs mt-8 px-4 leading-relaxed">
          HK Trip Companion · PWA offline-ready<br/>
          Dữ liệu lưu trên máy bạn · Bấm badge ở góc phải header để chuyển online/offline
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState('phrase');
  const TABS = [
    { id: 'phrase', label: 'Nói', icon: '💬' },
    { id: 'plan', label: 'Lịch', icon: '📅' },
    { id: 'money', label: 'Tiền', icon: '💵' },
    { id: 'check', label: 'List', icon: '✓' },
    { id: 'info', label: 'Info', icon: 'ℹ️' },
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      {tab === 'phrase' && <PhrasebookView />}
      {tab === 'plan' && <PlanView />}
      {tab === 'money' && <MoneyView />}
      {tab === 'check' && <ChecklistView />}
      {tab === 'info' && <InfoView />}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 grid grid-cols-5 z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={tab === t.id ? { color: HK_RED } : {}}
            className={`no-tap py-2 flex flex-col items-center gap-0.5 ${tab === t.id ? '' : 'text-slate-400'}`}>
            <span className="text-xl leading-none">{t.icon}</span>
            <span className="text-xs font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <OnlineProvider><App /></OnlineProvider>
);
