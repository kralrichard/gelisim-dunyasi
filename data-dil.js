/* ===== 50 DİL — her dilde 6 konu, her konuda 4 kelime =====
   t[i] = 'türkçe=hedefdil|türkçe=hedefdil|...'
   Konu başlıkları DIL_TEMALAR ile ortaktır.
*/
const DIL_TEMALAR = ['Selamlaşma','Sayılar','Yemek & İçecek','Yolculuk','Fiiller','Kısa Cümleler'];

const DILLER = [
{id:'en',n:'İngilizce',e:'🇬🇧',a:'#7cb8ff',b:'#1e40af',t:[
 'merhaba=hello|günaydın=good morning|teşekkürler=thank you|hoşça kal=goodbye',
 'bir=one|iki=two|üç=three|on=ten',
 'su=water|ekmek=bread|elma=apple|çay=tea',
 'havaalanı=airport|otel=hotel|bilet=ticket|sol=left',
 'gitmek=to go|yemek=to eat|görmek=to see|almak=to buy',
 'Nasılsın?=How are you?|Adın ne?=What is your name?|Anlamıyorum=I don’t understand|Ne kadar?=How much?']},

{id:'de',n:'Almanca',e:'🇩🇪',a:'#fcd34d',b:'#78350f',t:[
 'merhaba=hallo|günaydın=guten Morgen|teşekkürler=danke|hoşça kal=tschüss',
 'bir=eins|iki=zwei|üç=drei|on=zehn',
 'su=Wasser|ekmek=Brot|elma=Apfel|çay=Tee',
 'havaalanı=Flughafen|otel=Hotel|bilet=Ticket|sol=links',
 'gitmek=gehen|yemek=essen|görmek=sehen|almak=kaufen',
 'Nasılsın?=Wie geht es dir?|Adın ne?=Wie heißt du?|Anlamıyorum=Ich verstehe nicht|Ne kadar?=Wie viel?']},

{id:'fr',n:'Fransızca',e:'🇫🇷',a:'#93c5fd',b:'#1e3a8a',t:[
 'merhaba=salut|günaydın=bonjour|teşekkürler=merci|hoşça kal=au revoir',
 'bir=un|iki=deux|üç=trois|on=dix',
 'su=eau|ekmek=pain|elma=pomme|çay=thé',
 'havaalanı=aéroport|otel=hôtel|bilet=billet|sol=gauche',
 'gitmek=aller|yemek=manger|görmek=voir|almak=acheter',
 'Nasılsın?=Comment ça va?|Adın ne?=Comment tu t’appelles?|Anlamıyorum=Je ne comprends pas|Ne kadar?=Combien?']},

{id:'es',n:'İspanyolca',e:'🇪🇸',a:'#fca5a5',b:'#991b1b',t:[
 'merhaba=hola|günaydın=buenos días|teşekkürler=gracias|hoşça kal=adiós',
 'bir=uno|iki=dos|üç=tres|on=diez',
 'su=agua|ekmek=pan|elma=manzana|çay=té',
 'havaalanı=aeropuerto|otel=hotel|bilet=billete|sol=izquierda',
 'gitmek=ir|yemek=comer|görmek=ver|almak=comprar',
 'Nasılsın?=¿Cómo estás?|Adın ne?=¿Cómo te llamas?|Anlamıyorum=No entiendo|Ne kadar?=¿Cuánto?']},

{id:'it',n:'İtalyanca',e:'🇮🇹',a:'#86efac',b:'#166534',t:[
 'merhaba=ciao|günaydın=buongiorno|teşekkürler=grazie|hoşça kal=arrivederci',
 'bir=uno|iki=due|üç=tre|on=dieci',
 'su=acqua|ekmek=pane|elma=mela|çay=tè',
 'havaalanı=aeroporto|otel=hotel|bilet=biglietto|sol=sinistra',
 'gitmek=andare|yemek=mangiare|görmek=vedere|almak=comprare',
 'Nasılsın?=Come stai?|Adın ne?=Come ti chiami?|Anlamıyorum=Non capisco|Ne kadar?=Quanto?']},

{id:'pt',n:'Portekizce',e:'🇵🇹',a:'#6ee7b7',b:'#065f46',t:[
 'merhaba=olá|günaydın=bom dia|teşekkürler=obrigado|hoşça kal=tchau',
 'bir=um|iki=dois|üç=três|on=dez',
 'su=água|ekmek=pão|elma=maçã|çay=chá',
 'havaalanı=aeroporto|otel=hotel|bilet=bilhete|sol=esquerda',
 'gitmek=ir|yemek=comer|görmek=ver|almak=comprar',
 'Nasılsın?=Como está?|Adın ne?=Qual é o seu nome?|Anlamıyorum=Não entendo|Ne kadar?=Quanto?']},

{id:'ru',n:'Rusça',e:'🇷🇺',a:'#a5b4fc',b:'#312e81',t:[
 'merhaba=привет|günaydın=доброе утро|teşekkürler=спасибо|hoşça kal=до свидания',
 'bir=один|iki=два|üç=три|on=десять',
 'su=вода|ekmek=хлеб|elma=яблоко|çay=чай',
 'havaalanı=аэропорт|otel=отель|bilet=билет|sol=налево',
 'gitmek=идти|yemek=есть|görmek=видеть|almak=покупать',
 'Nasılsın?=Как дела?|Adın ne?=Как тебя зовут?|Anlamıyorum=Я не понимаю|Ne kadar?=Сколько?']},

{id:'ar',n:'Arapça',e:'🇸🇦',a:'#fcd34d',b:'#854d0e',t:[
 'merhaba=مرحبا|günaydın=صباح الخير|teşekkürler=شكرا|hoşça kal=مع السلامة',
 'bir=واحد|iki=اثنان|üç=ثلاثة|on=عشرة',
 'su=ماء|ekmek=خبز|elma=تفاحة|çay=شاي',
 'havaalanı=مطار|otel=فندق|bilet=تذكرة|sol=يسار',
 'gitmek=يذهب|yemek=يأكل|görmek=يرى|almak=يشتري',
 'Nasılsın?=كيف حالك؟|Adın ne?=ما اسمك؟|Anlamıyorum=لا أفهم|Ne kadar?=كم؟']},

{id:'fa',n:'Farsça',e:'🇮🇷',a:'#5eead4',b:'#115e59',t:[
 'merhaba=سلام|günaydın=صبح بخیر|teşekkürler=ممنون|hoşça kal=خداحافظ',
 'bir=یک|iki=دو|üç=سه|on=ده',
 'su=آب|ekmek=نان|elma=سیب|çay=چای',
 'havaalanı=فرودگاه|otel=هتل|bilet=بلیط|sol=چپ',
 'gitmek=رفتن|yemek=خوردن|görmek=دیدن|almak=خریدن',
 'Nasılsın?=حال شما چطور است؟|Adın ne?=اسم شما چیست؟|Anlamıyorum=نمی‌فهمم|Ne kadar?=چقدر؟']},

{id:'ja',n:'Japonca',e:'🇯🇵',a:'#fda4af',b:'#9f1239',t:[
 'merhaba=こんにちは|günaydın=おはよう|teşekkürler=ありがとう|hoşça kal=さようなら',
 'bir=いち|iki=に|üç=さん|on=じゅう',
 'su=水|ekmek=パン|elma=りんご|çay=お茶',
 'havaalanı=空港|otel=ホテル|bilet=切符|sol=左',
 'gitmek=行く|yemek=食べる|görmek=見る|almak=買う',
 'Nasılsın?=お元気ですか？|Adın ne?=お名前は？|Anlamıyorum=わかりません|Ne kadar?=いくらですか？']},

{id:'ko',n:'Korece',e:'🇰🇷',a:'#93c5fd',b:'#1d4ed8',t:[
 'merhaba=안녕하세요|günaydın=좋은 아침|teşekkürler=감사합니다|hoşça kal=안녕히 가세요',
 'bir=하나|iki=둘|üç=셋|on=열',
 'su=물|ekmek=빵|elma=사과|çay=차',
 'havaalanı=공항|otel=호텔|bilet=표|sol=왼쪽',
 'gitmek=가다|yemek=먹다|görmek=보다|almak=사다',
 'Nasılsın?=어떻게 지내세요?|Adın ne?=이름이 뭐예요?|Anlamıyorum=이해 못 해요|Ne kadar?=얼마예요?']},

{id:'zh',n:'Çince',e:'🇨🇳',a:'#fca5a5',b:'#7f1d1d',t:[
 'merhaba=你好|günaydın=早上好|teşekkürler=谢谢|hoşça kal=再见',
 'bir=一|iki=二|üç=三|on=十',
 'su=水|ekmek=面包|elma=苹果|çay=茶',
 'havaalanı=机场|otel=酒店|bilet=票|sol=左',
 'gitmek=去|yemek=吃|görmek=看|almak=买',
 'Nasılsın?=你好吗？|Adın ne?=你叫什么名字？|Anlamıyorum=我不明白|Ne kadar?=多少钱？']},

{id:'hi',n:'Hintçe',e:'🇮🇳',a:'#fdba74',b:'#9a3412',t:[
 'merhaba=नमस्ते|günaydın=सुप्रभात|teşekkürler=धन्यवाद|hoşça kal=अलविदा',
 'bir=एक|iki=दो|üç=तीन|on=दस',
 'su=पानी|ekmek=रोटी|elma=सेब|çay=चाय',
 'havaalanı=हवाई अड्डा|otel=होटल|bilet=टिकट|sol=बाएँ',
 'gitmek=जाना|yemek=खाना|görmek=देखना|almak=खरीदना',
 'Nasılsın?=आप कैसे हैं?|Adın ne?=आपका नाम क्या है?|Anlamıyorum=मैं नहीं समझता|Ne kadar?=कितना?']},

{id:'el',n:'Yunanca',e:'🇬🇷',a:'#7dd3fc',b:'#0c4a6e',t:[
 'merhaba=γεια σου|günaydın=καλημέρα|teşekkürler=ευχαριστώ|hoşça kal=αντίο',
 'bir=ένα|iki=δύο|üç=τρία|on=δέκα',
 'su=νερό|ekmek=ψωμί|elma=μήλο|çay=τσάι',
 'havaalanı=αεροδρόμιο|otel=ξενοδοχείο|bilet=εισιτήριο|sol=αριστερά',
 'gitmek=πηγαίνω|yemek=τρώω|görmek=βλέπω|almak=αγοράζω',
 'Nasılsın?=Τι κάνεις;|Adın ne?=Πώς σε λένε;|Anlamıyorum=Δεν καταλαβαίνω|Ne kadar?=Πόσο κάνει;']},

{id:'nl',n:'Hollandaca',e:'🇳🇱',a:'#fdba74',b:'#c2410c',t:[
 'merhaba=hallo|günaydın=goedemorgen|teşekkürler=dank je|hoşça kal=tot ziens',
 'bir=een|iki=twee|üç=drie|on=tien',
 'su=water|ekmek=brood|elma=appel|çay=thee',
 'havaalanı=luchthaven|otel=hotel|bilet=ticket|sol=links',
 'gitmek=gaan|yemek=eten|görmek=zien|almak=kopen',
 'Nasılsın?=Hoe gaat het?|Adın ne?=Hoe heet je?|Anlamıyorum=Ik begrijp het niet|Ne kadar?=Hoeveel?']},

{id:'sv',n:'İsveççe',e:'🇸🇪',a:'#fde047',b:'#1e40af',t:[
 'merhaba=hej|günaydın=god morgon|teşekkürler=tack|hoşça kal=hej då',
 'bir=ett|iki=två|üç=tre|on=tio',
 'su=vatten|ekmek=bröd|elma=äpple|çay=te',
 'havaalanı=flygplats|otel=hotell|bilet=biljett|sol=vänster',
 'gitmek=gå|yemek=äta|görmek=se|almak=köpa',
 'Nasılsın?=Hur mår du?|Adın ne?=Vad heter du?|Anlamıyorum=Jag förstår inte|Ne kadar?=Hur mycket?']},

{id:'no',n:'Norveççe',e:'🇳🇴',a:'#fca5a5',b:'#1e3a8a',t:[
 'merhaba=hei|günaydın=god morgen|teşekkürler=takk|hoşça kal=ha det',
 'bir=en|iki=to|üç=tre|on=ti',
 'su=vann|ekmek=brød|elma=eple|çay=te',
 'havaalanı=flyplass|otel=hotell|bilet=billett|sol=venstre',
 'gitmek=gå|yemek=spise|görmek=se|almak=kjøpe',
 'Nasılsın?=Hvordan går det?|Adın ne?=Hva heter du?|Anlamıyorum=Jeg forstår ikke|Ne kadar?=Hvor mye?']},

{id:'da',n:'Danca',e:'🇩🇰',a:'#fda4af',b:'#9f1239',t:[
 'merhaba=hej|günaydın=godmorgen|teşekkürler=tak|hoşça kal=farvel',
 'bir=en|iki=to|üç=tre|on=ti',
 'su=vand|ekmek=brød|elma=æble|çay=te',
 'havaalanı=lufthavn|otel=hotel|bilet=billet|sol=venstre',
 'gitmek=gå|yemek=spise|görmek=se|almak=købe',
 'Nasılsın?=Hvordan går det?|Adın ne?=Hvad hedder du?|Anlamıyorum=Jeg forstår ikke|Ne kadar?=Hvor meget?']},

{id:'fi',n:'Fince',e:'🇫🇮',a:'#bae6fd',b:'#1d4ed8',t:[
 'merhaba=hei|günaydın=hyvää huomenta|teşekkürler=kiitos|hoşça kal=näkemiin',
 'bir=yksi|iki=kaksi|üç=kolme|on=kymmenen',
 'su=vesi|ekmek=leipä|elma=omena|çay=tee',
 'havaalanı=lentokenttä|otel=hotelli|bilet=lippu|sol=vasen',
 'gitmek=mennä|yemek=syödä|görmek=nähdä|almak=ostaa',
 'Nasılsın?=Mitä kuuluu?|Adın ne?=Mikä sinun nimesi on?|Anlamıyorum=En ymmärrä|Ne kadar?=Paljonko?']},

{id:'pl',n:'Lehçe',e:'🇵🇱',a:'#fecaca',b:'#991b1b',t:[
 'merhaba=cześć|günaydın=dzień dobry|teşekkürler=dziękuję|hoşça kal=do widzenia',
 'bir=jeden|iki=dwa|üç=trzy|on=dziesięć',
 'su=woda|ekmek=chleb|elma=jabłko|çay=herbata',
 'havaalanı=lotnisko|otel=hotel|bilet=bilet|sol=lewo',
 'gitmek=iść|yemek=jeść|görmek=widzieć|almak=kupować',
 'Nasılsın?=Jak się masz?|Adın ne?=Jak masz na imię?|Anlamıyorum=Nie rozumiem|Ne kadar?=Ile?']},

{id:'cs',n:'Çekçe',e:'🇨🇿',a:'#a5b4fc',b:'#3730a3',t:[
 'merhaba=ahoj|günaydın=dobré ráno|teşekkürler=děkuji|hoşça kal=na shledanou',
 'bir=jedna|iki=dva|üç=tři|on=deset',
 'su=voda|ekmek=chléb|elma=jablko|çay=čaj',
 'havaalanı=letiště|otel=hotel|bilet=lístek|sol=vlevo',
 'gitmek=jít|yemek=jíst|görmek=vidět|almak=koupit',
 'Nasılsın?=Jak se máš?|Adın ne?=Jak se jmenuješ?|Anlamıyorum=Nerozumím|Ne kadar?=Kolik?']},

{id:'sk',n:'Slovakça',e:'🇸🇰',a:'#93c5fd',b:'#1e40af',t:[
 'merhaba=ahoj|günaydın=dobré ráno|teşekkürler=ďakujem|hoşça kal=dovidenia',
 'bir=jeden|iki=dva|üç=tri|on=desať',
 'su=voda|ekmek=chlieb|elma=jablko|çay=čaj',
 'havaalanı=letisko|otel=hotel|bilet=lístok|sol=vľavo',
 'gitmek=ísť|yemek=jesť|görmek=vidieť|almak=kúpiť',
 'Nasılsın?=Ako sa máš?|Adın ne?=Ako sa voláš?|Anlamıyorum=Nerozumiem|Ne kadar?=Koľko?']},

{id:'hu',n:'Macarca',e:'🇭🇺',a:'#86efac',b:'#14532d',t:[
 'merhaba=szia|günaydın=jó reggelt|teşekkürler=köszönöm|hoşça kal=viszlát',
 'bir=egy|iki=kettő|üç=három|on=tíz',
 'su=víz|ekmek=kenyér|elma=alma|çay=tea',
 'havaalanı=repülőtér|otel=szálloda|bilet=jegy|sol=bal',
 'gitmek=menni|yemek=enni|görmek=látni|almak=venni',
 'Nasılsın?=Hogy vagy?|Adın ne?=Hogy hívnak?|Anlamıyorum=Nem értem|Ne kadar?=Mennyi?']},

{id:'ro',n:'Romence',e:'🇷🇴',a:'#fcd34d',b:'#1e3a8a',t:[
 'merhaba=salut|günaydın=bună dimineața|teşekkürler=mulțumesc|hoşça kal=la revedere',
 'bir=unu|iki=doi|üç=trei|on=zece',
 'su=apă|ekmek=pâine|elma=măr|çay=ceai',
 'havaalanı=aeroport|otel=hotel|bilet=bilet|sol=stânga',
 'gitmek=a merge|yemek=a mânca|görmek=a vedea|almak=a cumpăra',
 'Nasılsın?=Ce mai faci?|Adın ne?=Cum te cheamă?|Anlamıyorum=Nu înțeleg|Ne kadar?=Cât costă?']},

{id:'bg',n:'Bulgarca',e:'🇧🇬',a:'#6ee7b7',b:'#065f46',t:[
 'merhaba=здравей|günaydın=добро утро|teşekkürler=благодаря|hoşça kal=довиждане',
 'bir=едно|iki=две|üç=три|on=десет',
 'su=вода|ekmek=хляб|elma=ябълка|çay=чай',
 'havaalanı=летище|otel=хотел|bilet=билет|sol=ляво',
 'gitmek=отивам|yemek=ям|görmek=виждам|almak=купувам',
 'Nasılsın?=Как си?|Adın ne?=Как се казваш?|Anlamıyorum=Не разбирам|Ne kadar?=Колко?']},

{id:'sr',n:'Sırpça',e:'🇷🇸',a:'#fca5a5',b:'#7f1d1d',t:[
 'merhaba=здраво|günaydın=добро јутро|teşekkürler=хвала|hoşça kal=довиђења',
 'bir=један|iki=два|üç=три|on=десет',
 'su=вода|ekmek=хлеб|elma=јабука|çay=чај',
 'havaalanı=аеродром|otel=хотел|bilet=карта|sol=лево',
 'gitmek=ићи|yemek=јести|görmek=видети|almak=купити',
 'Nasılsın?=Како си?|Adın ne?=Како се зовеш?|Anlamıyorum=Не разумем|Ne kadar?=Колико?']},

{id:'hr',n:'Hırvatça',e:'🇭🇷',a:'#93c5fd',b:'#1e40af',t:[
 'merhaba=bok|günaydın=dobro jutro|teşekkürler=hvala|hoşça kal=doviđenja',
 'bir=jedan|iki=dva|üç=tri|on=deset',
 'su=voda|ekmek=kruh|elma=jabuka|çay=čaj',
 'havaalanı=zračna luka|otel=hotel|bilet=karta|sol=lijevo',
 'gitmek=ići|yemek=jesti|görmek=vidjeti|almak=kupiti',
 'Nasılsın?=Kako si?|Adın ne?=Kako se zoveš?|Anlamıyorum=Ne razumijem|Ne kadar?=Koliko?']},

{id:'bs',n:'Boşnakça',e:'🇧🇦',a:'#a3e635',b:'#3f6212',t:[
 'merhaba=zdravo|günaydın=dobro jutro|teşekkürler=hvala|hoşça kal=doviđenja',
 'bir=jedan|iki=dva|üç=tri|on=deset',
 'su=voda|ekmek=hljeb|elma=jabuka|çay=čaj',
 'havaalanı=aerodrom|otel=hotel|bilet=karta|sol=lijevo',
 'gitmek=ići|yemek=jesti|görmek=vidjeti|almak=kupiti',
 'Nasılsın?=Kako si?|Adın ne?=Kako se zoveš?|Anlamıyorum=Ne razumijem|Ne kadar?=Koliko?']},

{id:'sl',n:'Slovence',e:'🇸🇮',a:'#67e8f9',b:'#155e75',t:[
 'merhaba=zdravo|günaydın=dobro jutro|teşekkürler=hvala|hoşça kal=nasvidenje',
 'bir=ena|iki=dve|üç=tri|on=deset',
 'su=voda|ekmek=kruh|elma=jabolko|çay=čaj',
 'havaalanı=letališče|otel=hotel|bilet=vozovnica|sol=levo',
 'gitmek=iti|yemek=jesti|görmek=videti|almak=kupiti',
 'Nasılsın?=Kako si?|Adın ne?=Kako ti je ime?|Anlamıyorum=Ne razumem|Ne kadar?=Koliko?']},

{id:'sq',n:'Arnavutça',e:'🇦🇱',a:'#fca5a5',b:'#7f1d1d',t:[
 'merhaba=përshëndetje|günaydın=mirëmëngjes|teşekkürler=faleminderit|hoşça kal=mirupafshim',
 'bir=një|iki=dy|üç=tre|on=dhjetë',
 'su=ujë|ekmek=bukë|elma=mollë|çay=çaj',
 'havaalanı=aeroport|otel=hotel|bilet=biletë|sol=majtas',
 'gitmek=të shkosh|yemek=të hash|görmek=të shohësh|almak=të blesh',
 'Nasılsın?=Si je?|Adın ne?=Si e ke emrin?|Anlamıyorum=Nuk kuptoj|Ne kadar?=Sa kushton?']},

{id:'uk',n:'Ukraynaca',e:'🇺🇦',a:'#fde047',b:'#1d4ed8',t:[
 'merhaba=привіт|günaydın=доброго ранку|teşekkürler=дякую|hoşça kal=до побачення',
 'bir=один|iki=два|üç=три|on=десять',
 'su=вода|ekmek=хліб|elma=яблуко|çay=чай',
 'havaalanı=аеропорт|otel=готель|bilet=квиток|sol=ліворуч',
 'gitmek=йти|yemek=їсти|görmek=бачити|almak=купувати',
 'Nasılsın?=Як справи?|Adın ne?=Як тебе звати?|Anlamıyorum=Я не розумію|Ne kadar?=Скільки?']},

{id:'lt',n:'Litvanca',e:'🇱🇹',a:'#fcd34d',b:'#166534',t:[
 'merhaba=labas|günaydın=labas rytas|teşekkürler=ačiū|hoşça kal=viso gero',
 'bir=vienas|iki=du|üç=trys|on=dešimt',
 'su=vanduo|ekmek=duona|elma=obuolys|çay=arbata',
 'havaalanı=oro uostas|otel=viešbutis|bilet=bilietas|sol=kairė',
 'gitmek=eiti|yemek=valgyti|görmek=matyti|almak=pirkti',
 'Nasılsın?=Kaip sekasi?|Adın ne?=Koks tavo vardas?|Anlamıyorum=Nesuprantu|Ne kadar?=Kiek?']},

{id:'lv',n:'Letonca',e:'🇱🇻',a:'#fecaca',b:'#991b1b',t:[
 'merhaba=sveiki|günaydın=labrīt|teşekkürler=paldies|hoşça kal=uz redzēšanos',
 'bir=viens|iki=divi|üç=trīs|on=desmit',
 'su=ūdens|ekmek=maize|elma=ābols|çay=tēja',
 'havaalanı=lidosta|otel=viesnīca|bilet=biļete|sol=pa kreisi',
 'gitmek=iet|yemek=ēst|görmek=redzēt|almak=pirkt',
 'Nasılsın?=Kā tev iet?|Adın ne?=Kā tevi sauc?|Anlamıyorum=Es nesaprotu|Ne kadar?=Cik?']},

{id:'et',n:'Estonca',e:'🇪🇪',a:'#bae6fd',b:'#0c4a6e',t:[
 'merhaba=tere|günaydın=tere hommikust|teşekkürler=aitäh|hoşça kal=nägemist',
 'bir=üks|iki=kaks|üç=kolm|on=kümme',
 'su=vesi|ekmek=leib|elma=õun|çay=tee',
 'havaalanı=lennujaam|otel=hotell|bilet=pilet|sol=vasak',
 'gitmek=minema|yemek=sööma|görmek=nägema|almak=ostma',
 'Nasılsın?=Kuidas läheb?|Adın ne?=Mis su nimi on?|Anlamıyorum=Ma ei saa aru|Ne kadar?=Kui palju?']},

{id:'he',n:'İbranice',e:'🇮🇱',a:'#93c5fd',b:'#1e3a8a',t:[
 'merhaba=שלום|günaydın=בוקר טוב|teşekkürler=תודה|hoşça kal=להתראות',
 'bir=אחד|iki=שתיים|üç=שלוש|on=עשר',
 'su=מים|ekmek=לחם|elma=תפוח|çay=תה',
 'havaalanı=שדה תעופה|otel=מלון|bilet=כרטיס|sol=שמאל',
 'gitmek=ללכת|yemek=לאכול|görmek=לראות|almak=לקנות',
 'Nasılsın?=מה שלומך?|Adın ne?=איך קוראים לך?|Anlamıyorum=אני לא מבין|Ne kadar?=כמה?']},

{id:'id',n:'Endonezce',e:'🇮🇩',a:'#fca5a5',b:'#991b1b',t:[
 'merhaba=halo|günaydın=selamat pagi|teşekkürler=terima kasih|hoşça kal=sampai jumpa',
 'bir=satu|iki=dua|üç=tiga|on=sepuluh',
 'su=air|ekmek=roti|elma=apel|çay=teh',
 'havaalanı=bandara|otel=hotel|bilet=tiket|sol=kiri',
 'gitmek=pergi|yemek=makan|görmek=melihat|almak=membeli',
 'Nasılsın?=Apa kabar?|Adın ne?=Siapa nama kamu?|Anlamıyorum=Saya tidak mengerti|Ne kadar?=Berapa?']},

{id:'ms',n:'Malayca',e:'🇲🇾',a:'#fcd34d',b:'#1e40af',t:[
 'merhaba=helo|günaydın=selamat pagi|teşekkürler=terima kasih|hoşça kal=selamat tinggal',
 'bir=satu|iki=dua|üç=tiga|on=sepuluh',
 'su=air|ekmek=roti|elma=epal|çay=teh',
 'havaalanı=lapangan terbang|otel=hotel|bilet=tiket|sol=kiri',
 'gitmek=pergi|yemek=makan|görmek=melihat|almak=membeli',
 'Nasılsın?=Apa khabar?|Adın ne?=Siapa nama awak?|Anlamıyorum=Saya tidak faham|Ne kadar?=Berapa?']},

{id:'th',n:'Tayca',e:'🇹🇭',a:'#c4b5fd',b:'#5b21b6',t:[
 'merhaba=สวัสดี|günaydın=อรุณสวัสดิ์|teşekkürler=ขอบคุณ|hoşça kal=ลาก่อน',
 'bir=หนึ่ง|iki=สอง|üç=สาม|on=สิบ',
 'su=น้ำ|ekmek=ขนมปัง|elma=แอปเปิ้ล|çay=ชา',
 'havaalanı=สนามบิน|otel=โรงแรม|bilet=ตั๋ว|sol=ซ้าย',
 'gitmek=ไป|yemek=กิน|görmek=เห็น|almak=ซื้อ',
 'Nasılsın?=สบายดีไหม|Adın ne?=คุณชื่ออะไร|Anlamıyorum=ฉันไม่เข้าใจ|Ne kadar?=เท่าไหร่']},

{id:'vi',n:'Vietnamca',e:'🇻🇳',a:'#fde047',b:'#991b1b',t:[
 'merhaba=xin chào|günaydın=chào buổi sáng|teşekkürler=cảm ơn|hoşça kal=tạm biệt',
 'bir=một|iki=hai|üç=ba|on=mười',
 'su=nước|ekmek=bánh mì|elma=táo|çay=trà',
 'havaalanı=sân bay|otel=khách sạn|bilet=vé|sol=trái',
 'gitmek=đi|yemek=ăn|görmek=thấy|almak=mua',
 'Nasılsın?=Bạn khỏe không?|Adın ne?=Bạn tên gì?|Anlamıyorum=Tôi không hiểu|Ne kadar?=Bao nhiêu?']},

{id:'tl',n:'Filipince',e:'🇵🇭',a:'#93c5fd',b:'#1d4ed8',t:[
 'merhaba=kumusta|günaydın=magandang umaga|teşekkürler=salamat|hoşça kal=paalam',
 'bir=isa|iki=dalawa|üç=tatlo|on=sampu',
 'su=tubig|ekmek=tinapay|elma=mansanas|çay=tsaa',
 'havaalanı=paliparan|otel=hotel|bilet=tiket|sol=kaliwa',
 'gitmek=pumunta|yemek=kumain|görmek=makita|almak=bumili',
 'Nasılsın?=Kumusta ka?|Adın ne?=Ano ang pangalan mo?|Anlamıyorum=Hindi ko naiintindihan|Ne kadar?=Magkano?']},

{id:'sw',n:'Svahili',e:'🇰🇪',a:'#86efac',b:'#14532d',t:[
 'merhaba=jambo|günaydın=habari za asubuhi|teşekkürler=asante|hoşça kal=kwaheri',
 'bir=moja|iki=mbili|üç=tatu|on=kumi',
 'su=maji|ekmek=mkate|elma=tofaa|çay=chai',
 'havaalanı=uwanja wa ndege|otel=hoteli|bilet=tikiti|sol=kushoto',
 'gitmek=kwenda|yemek=kula|görmek=kuona|almak=kununua',
 'Nasılsın?=Habari yako?|Adın ne?=Jina lako nani?|Anlamıyorum=Sielewi|Ne kadar?=Bei gani?']},

{id:'af',n:'Afrikaanca',e:'🇿🇦',a:'#fdba74',b:'#9a3412',t:[
 'merhaba=hallo|günaydın=goeie môre|teşekkürler=dankie|hoşça kal=totsiens',
 'bir=een|iki=twee|üç=drie|on=tien',
 'su=water|ekmek=brood|elma=appel|çay=tee',
 'havaalanı=lughawe|otel=hotel|bilet=kaartjie|sol=links',
 'gitmek=gaan|yemek=eet|görmek=sien|almak=koop',
 'Nasılsın?=Hoe gaan dit?|Adın ne?=Wat is jou naam?|Anlamıyorum=Ek verstaan nie|Ne kadar?=Hoeveel?']},

{id:'ca',n:'Katalanca',e:'🇦🇩',a:'#fcd34d',b:'#b91c1c',t:[
 'merhaba=hola|günaydın=bon dia|teşekkürler=gràcies|hoşça kal=adéu',
 'bir=un|iki=dos|üç=tres|on=deu',
 'su=aigua|ekmek=pa|elma=poma|çay=te',
 'havaalanı=aeroport|otel=hotel|bilet=bitllet|sol=esquerra',
 'gitmek=anar|yemek=menjar|görmek=veure|almak=comprar',
 'Nasılsın?=Com estàs?|Adın ne?=Com et dius?|Anlamıyorum=No ho entenc|Ne kadar?=Quant?']},

{id:'az',n:'Azerbaycanca',e:'🇦🇿',a:'#5eead4',b:'#0f766e',t:[
 'merhaba=salam|günaydın=sabahınız xeyir|teşekkürler=təşəkkür edirəm|hoşça kal=sağ olun',
 'bir=bir|iki=iki|üç=üç|on=on',
 'su=su|ekmek=çörək|elma=alma|çay=çay',
 'havaalanı=hava limanı|otel=otel|bilet=bilet|sol=sol',
 'gitmek=getmək|yemek=yemək|görmek=görmək|almak=almaq',
 'Nasılsın?=Necəsən?|Adın ne?=Adın nədir?|Anlamıyorum=Başa düşmürəm|Ne kadar?=Neçəyə?']},

{id:'kk',n:'Kazakça',e:'🇰🇿',a:'#7dd3fc',b:'#0e7490',t:[
 'merhaba=сәлем|günaydın=қайырлы таң|teşekkürler=рахмет|hoşça kal=сау болыңыз',
 'bir=бір|iki=екі|üç=үш|on=он',
 'su=су|ekmek=нан|elma=алма|çay=шай',
 'havaalanı=әуежай|otel=қонақ үй|bilet=билет|sol=сол',
 'gitmek=бару|yemek=жеу|görmek=көру|almak=сатып алу',
 'Nasılsın?=Қалың қалай?|Adın ne?=Атың кім?|Anlamıyorum=Мен түсінбеймін|Ne kadar?=Қанша?']},

{id:'uz',n:'Özbekçe',e:'🇺🇿',a:'#a3e635',b:'#3f6212',t:[
 'merhaba=salom|günaydın=xayrli tong|teşekkürler=rahmat|hoşça kal=xayr',
 'bir=bir|iki=ikki|üç=uch|on=oʻn',
 'su=suv|ekmek=non|elma=olma|çay=choy',
 'havaalanı=aeroport|otel=mehmonxona|bilet=chipta|sol=chap',
 'gitmek=bormoq|yemek=yemoq|görmek=koʻrmoq|almak=sotib olmoq',
 'Nasılsın?=Qalaysiz?|Adın ne?=Ismingiz nima?|Anlamıyorum=Tushunmayapman|Ne kadar?=Qancha?']},

{id:'ka',n:'Gürcüce',e:'🇬🇪',a:'#fca5a5',b:'#7f1d1d',t:[
 'merhaba=გამარჯობა|günaydın=დილა მშვიდობისა|teşekkürler=გმადლობთ|hoşça kal=ნახვამდის',
 'bir=ერთი|iki=ორი|üç=სამი|on=ათი',
 'su=წყალი|ekmek=პური|elma=ვაშლი|çay=ჩაი',
 'havaalanı=აეროპორტი|otel=სასტუმრო|bilet=ბილეთი|sol=მარცხნივ',
 'gitmek=წასვლა|yemek=ჭამა|görmek=ნახვა|almak=ყიდვა',
 'Nasılsın?=როგორ ხარ?|Adın ne?=რა გქვია?|Anlamıyorum=ვერ გავიგე|Ne kadar?=რამდენი?']},

{id:'hy',n:'Ermenice',e:'🇦🇲',a:'#fdba74',b:'#c2410c',t:[
 'merhaba=բարև|günaydın=բարի լույս|teşekkürler=շնորհակալություն|hoşça kal=ցտեսություն',
 'bir=մեկ|iki=երկու|üç=երեք|on=տասը',
 'su=ջուր|ekmek=հաց|elma=խնձոր|çay=թեյ',
 'havaalanı=օդանավակայան|otel=հյուրանոց|bilet=տոմս|sol=ձախ',
 'gitmek=գնալ|yemek=ուտել|görmek=տեսնել|almak=գնել',
 'Nasılsın?=Ինչպե՞ս ես|Adın ne?=Ի՞նչ է քո անունը|Anlamıyorum=Ես չեմ հասկանում|Ne kadar?=Որքա՞ն']},

{id:'is',n:'İzlandaca',e:'🇮🇸',a:'#bae6fd',b:'#1e40af',t:[
 'merhaba=halló|günaydın=góðan daginn|teşekkürler=takk|hoşça kal=bless',
 'bir=einn|iki=tveir|üç=þrír|on=tíu',
 'su=vatn|ekmek=brauð|elma=epli|çay=te',
 'havaalanı=flugvöllur|otel=hótel|bilet=miði|sol=vinstri',
 'gitmek=fara|yemek=borða|görmek=sjá|almak=kaupa',
 'Nasılsın?=Hvernig hefurðu það?|Adın ne?=Hvað heitir þú?|Anlamıyorum=Ég skil ekki|Ne kadar?=Hvað kostar?']},

{id:'ga',n:'İrlandaca',e:'🇮🇪',a:'#86efac',b:'#166534',t:[
 'merhaba=dia duit|günaydın=maidin mhaith|teşekkürler=go raibh maith agat|hoşça kal=slán',
 'bir=a haon|iki=a dó|üç=a trí|on=a deich',
 'su=uisce|ekmek=arán|elma=úll|çay=tae',
 'havaalanı=aerfort|otel=óstán|bilet=ticéad|sol=ar chlé',
 'gitmek=dul|yemek=ithe|görmek=feiceáil|almak=ceannach',
 'Nasılsın?=Conas atá tú?|Adın ne?=Cad is ainm duit?|Anlamıyorum=Ní thuigim|Ne kadar?=Cé mhéad?']},
];
