// Виджет Гусиного Интернета v3.1 (исправленная версия) 
(function() {
    // Конфигурация
    const config = {
        supabaseUrl: 'https://uvhtwedzxejuwiaofavk.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2aHR3ZWR6eGVqdXdpYW9mYXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNDA3MjgsImV4cCI6MjA4MDcxNjcyOH0.9l4Xlj4CwRJS9Q3cT-pK9udW25-ptewrozUDbLgTjUM',
        hubUrl: 'https://goosenet-one.vercel.app/',
        loginUrl: 'https://goosenet-one.vercel.app/login.html'
    };
    
    // Глобальные переменные
    let supabaseClient = null;
    let currentUser = null;
    let isInitialized = false;
    
    // Загружаем Supabase и инициализируем
    function loadAndInit() {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже Supabase
            if (window.supabase) {
                initSupabase().then(resolve).catch(reject);
                return;
            }
            
            // Загружаем Supabase
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2';
            
            script.onload = () => {
                console.log('🦢 Supabase загружен');
                initSupabase().then(resolve).catch(reject);
            };
            
            script.onerror = (error) => {
                console.error('🦢 Ошибка загрузки Supabase:', error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }
    
    // Инициализация Supabase клиента
    async function initSupabase() {
        try {
            // Проверяем, что библиотека загружена
            if (!window.supabase) {
                throw new Error('Supabase library not loaded');
            }
            
            // Создаём клиент
            supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
            
            // Проверяем соединение
            const { data, error } = await supabaseClient.from('sites').select('count', { count: 'exact', head: true });
            
            if (error) {
                console.warn('🦢 Предупреждение при проверке соединения:', error.message);
            } else {
                console.log('🦢 Соединение с Supabase установлено');
            }
            
            return supabaseClient;
        } catch (error) {
            console.error('🦢 Ошибка инициализации Supabase:', error);
            throw error;
        }
    }
    
    // Инициализация виджета
    async function initWidget() {
        try {
            // Загружаем и инициализируем Supabase
            await loadAndInit();
            
            // Проверяем текущую сессию
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                currentUser = session.user;
                updateWidgetUI(true);
            } else {
                updateWidgetUI(false);
            }
            
            // Слушаем сообщения от popup
            window.addEventListener('message', handleLoginMessage);
            
            // Слушаем изменения авторизации
            supabaseClient.auth.onAuthStateChange((event, session) => {
                console.log('🦢 Auth state changed:', event, session?.user?.email);
                if (session) {
                    currentUser = session.user;
                    updateWidgetUI(true);
                } else {
                    currentUser = null;
                    updateWidgetUI(false);
                }
            });
            
            isInitialized = true;
            console.log('🦢 Виджет инициализирован');
            
        } catch (error) {
            console.error('🦢 Ошибка инициализации виджета:', error);
            // Показываем базовый интерфейс даже при ошибке
            updateWidgetUI(false);
        }
    }
    
    // Обработка сообщений от popup
    function handleLoginMessage(event) {
        if (event.data.type === 'GOOSE_LOGIN_COMPLETE' && event.data.success) {
            // Обновляем сессию
            if (supabaseClient) {
                supabaseClient.auth.setSession(event.data.session);
            }
        }
    }
    
    // Создаём интерфейс виджета
    function createWidget() {
        // Стили
        const style = document.createElement('style');
        style.textContent = `
            .goose-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: Arial, sans-serif;
            }
            .goose-btn {
                background: #ffcc00;
                color: #333;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            }
            .goose-btn:hover {
                background: #ffd633;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.25);
            }
            .goose-btn:active {
                transform: translateY(0);
            }
            .goose-user-menu {
                position: absolute;
                bottom: 70px;
                right: 0;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 30px rgba(0,0,0,0.3);
                min-width: 250px;
                padding: 15px;
                display: none;
                z-index: 10000;
            }
            .goose-user-menu.active {
                display: block;
                animation: slideUp 0.3s ease;
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .user-info {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .user-avatar {
                width: 40px;
                height: 40px;
                background: #ffcc00;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: #333;
            }
            .user-email {
                font-size: 14px;
                color: #666;
                word-break: break-all;
            }
            .menu-item {
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: background 0.2s;
            }
            .menu-item:hover {
                background: #f5f5f5;
            }
            .menu-divider {
                height: 1px;
                background: #eee;
                margin: 10px 0;
            }
            .logout-btn {
                color: #dc3545;
            }
            .site-count {
                background: #e9ecef;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                margin-left: auto;
            }
            .goose-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9998;
                display: none;
            }
            .goose-overlay.active {
                display: block;
            }
            .goose-loading {
                opacity: 0.7;
                cursor: wait;
            }
        `;
        document.head.appendChild(style);
        
        // Основной контейнер
        const widget = document.createElement('div');
        widget.className = 'goose-widget';
        widget.innerHTML = `
            <button class="goose-btn" id="goose-main-btn">
                <span>🦢</span>
                <span id="btn-text">Загрузка...</span>
            </button>
            <div class="goose-user-menu" id="user-menu">
                <div class="user-info">
                    <div class="user-avatar" id="user-avatar">Г</div>
                    <div>
                        <div id="user-name">Загрузка...</div>
                        <div class="user-email" id="user-email">инициализация виджета</div>
                    </div>
                </div>
                <div class="menu-item" onclick="window.open('${config.hubUrl}', '_blank')">
                    🏠 Перейти в хаб
                </div>
                <div class="menu-item" onclick="window.open('${config.hubUrl}/profile.html', '_blank')">
                    👤 Мой профиль
                </div>
                <div class="menu-item" onclick="window.open('${config.hubUrl}/sites.html', '_blank')">
                    🌐 Мои сайты <span class="site-count" id="site-count">0</span>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item logout-btn" id="logout-btn">
                    🚪 Выйти
                </div>
            </div>
            <div class="goose-overlay" id="overlay"></div>
        `;
        document.body.appendChild(widget);
        
        // Обработчики событий
        const mainBtn = document.getElementById('goose-main-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        mainBtn.addEventListener('click', toggleMenu);
        document.getElementById('overlay').addEventListener('click', closeMenu);
        logoutBtn.addEventListener('click', gooseLogout);
        
        // Закрытие меню при клике вне
        document.addEventListener('click', (event) => {
            if (!widget.contains(event.target)) {
                closeMenu();
            }
        });
    }
    
    // Обновление UI виджета
    function updateWidgetUI(isLoggedIn) {
        const btn = document.getElementById('goose-main-btn');
        const btnText = document.getElementById('btn-text');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');
        
        if (!isInitialized) {
            btnText.textContent = 'Инициализация...';
            btn.classList.add('goose-loading');
            return;
        }
        
        btn.classList.remove('goose-loading');
        
        if (isLoggedIn && currentUser) {
            const username = currentUser.email.split('@')[0];
            btnText.textContent = username;
            userName.textContent = username;
            userEmail.textContent = currentUser.email;
            userAvatar.textContent = username[0].toUpperCase();
            userAvatar.style.background = stringToColor(currentUser.email);
            
            // Загружаем количество сайтов пользователя
            loadUserSitesCount();
        } else {
            btnText.textContent = 'Гусиный ключ';
            userName.textContent = 'Гость';
            userEmail.textContent = 'войдите в аккаунт';
            userAvatar.textContent = 'Г';
            userAvatar.style.background = '#ffcc00';
            document.getElementById('site-count').textContent = '0';
        }
    }
    
    // Загрузка количества сайтов пользователя
    async function loadUserSitesCount() {
        if (!supabaseClient || !currentUser) return;
        
        try {
            const { count, error } = await supabaseClient
                .from('sites')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);
            
            if (!error && count !== null) {
                document.getElementById('site-count').textContent = count;
            }
        } catch (error) {
            console.error('Ошибка загрузки количества сайтов:', error);
        }
    }
    
    // Генерация цвета из строки
    function stringToColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `hsl(${hash % 360}, 70%, 65%)`;
        return color;
    }
    
    // Открытие popup для входа
    function openLoginPopup() {
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
            config.loginUrl,
            'goose_login',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
        
        if (popup) {
            popup.focus();
        } else {
            alert('Пожалуйста, разрешите всплывающие окна для входа в Гуснет');
            window.open(config.loginUrl, '_blank');
        }
    }
    
    // Выход из системы
    async function gooseLogout() {
        if (supabaseClient) {
            try {
                await supabaseClient.auth.signOut();
                closeMenu();
                // Обновляем UI
                updateWidgetUI(false);
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }
        }
    }
    
    // Управление меню
    function toggleMenu() {
        const menu = document.getElementById('user-menu');
        const overlay = document.getElementById('overlay');
        
        // Если виджет ещё не инициализирован, не показываем меню
        if (!isInitialized) {
            alert('Виджет инициализируется...');
            return;
        }
        
        if (currentUser) {
            // Если пользователь авторизован - показываем меню
            menu.classList.toggle('active');
            overlay.classList.toggle('active');
        } else {
            // Если не авторизован - открываем popup для входа
            openLoginPopup();
        }
    }
    
    function closeMenu() {
        document.getElementById('user-menu').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }
    
    // Глобальные функции для использования в HTML
    window.gooseLogout = gooseLogout;
    window.openGooseLogin = openLoginPopup;
    
    // Запускаем при загрузке страницы
    function startWidget() {
        console.log('🦢 Запуск виджета Гусиного Интернета');
        
        // Сначала создаём интерфейс
        createWidget();
        
        // Затем инициализируем (после полной загрузки страницы)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('🦢 DOM загружен, инициализируем виджет');
                initWidget();
            });
        } else {
            console.log('🦢 DOM уже загружен, инициализируем виджет');
            initWidget();
        }
    }
    
    // Запускаем виджет
    startWidget();
    
})();
