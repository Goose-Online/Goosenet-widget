// Виджет Гусиного Интернета
(function() {
    // Конфигурация
    const config = {
        supabaseUrl: 'https://ВАШ_PROJECT_ID.supabase.co',
        supabaseKey: 'ВАШ_ANON_PUBLIC_KEY',
        hubUrl: 'https://ваш-хаб.vercel.app'
    };
    
    // Создаём стили
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
            padding: 10px 15px;
            border-radius: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .goose-btn:hover { background: #ffd633; }
        .goose-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            min-width: 300px;
        }
        .goose-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        }
    `;
    document.head.appendChild(style);
    
    // Создаём кнопку
    const widget = document.createElement('div');
    widget.className = 'goose-widget';
    widget.innerHTML = `
        <button class="goose-btn">
            <span>🦢</span> Гусиный ключ
        </button>
    `;
    document.body.appendChild(widget);
    
    // Обработчик клика
    widget.querySelector('.goose-btn').addEventListener('click', async () => {
        // Проверяем, есть ли сессия
        const supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // Показываем информацию о пользователе
            showUserInfo(session.user);
        } else {
            // Показываем окно входа
            showLoginModal();
        }
    });
    
    function showUserInfo(user) {
        const modal = document.createElement('div');
        modal.className = 'goose-modal';
        modal.innerHTML = `
            <h3>🦢 Вы в Гуснете!</h3>
            <p>Привет, ${user.email}!</p>
            <p>Вы можете посетить <a href="${config.hubUrl}" target="_blank">хаб</a>.</p>
            <button onclick="this.closest('.goose-modal').remove()">Закрыть</button>
        `;
        document.body.appendChild(modal);
    }
    
    function showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'goose-modal';
        modal.innerHTML = `
            <h3>Вход в Гуснет</h3>
            <p>Для входа на этот сайт через Гуснет, посетите хаб:</p>
            <p><a href="${config.hubUrl}" target="_blank">${config.hubUrl}</a></p>
            <p>Зарегистрируйтесь там, затем вернитесь сюда.</p>
            <button onclick="this.closest('.goose-modal').remove()">Закрыть</button>
        `;
        document.body.appendChild(modal);
    }
    
    // Проверяем авторизацию при загрузке
    async function init() {
        const supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            console.log('🦢 Пользователь Гуснета авторизован:', session.user.email);
            // Можно, например, показать приветствие
        }
    }
    
    // Запускаем после загрузки страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
