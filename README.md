# Art SnowFall

Плагин снега на сайте. Легковесная, производительная реализация  снегопада на базе HTML5 Canvas.

[Changelog](https://github.com/artikus11/art-snowfall/blob/master/CHANGELOG.md)

## Требования
* **WordPress:** 6.3+.
* **PHP:** 7.4+.
* **Браузер:** Любой современный браузер с поддержкой HTML5 Canvas (Chrome, Firefox, Safari, Edge).


## Особенности

* Гарантирует наличие только одного экземпляра холста на странице, предотвращая утечки памяти и дублирование анимаций.
* Автоматически рассчитывает количество снежинок в зависимости от площади экрана (MPx). Идеально выглядит как на iPhone, так и на 4K мониторах.
* Использование `requestAnimationFrame` для плавной отрисовки.
* Оптимизированный цикл отрисовки (Batch Drawing).
* Автоматическая пауза анимации при переключении вкладки браузера (`Visibility API`).
* Поддержка высокого разрешения (DPR) для кристально четких линий.
* Параметр `pointer-events: none` гарантирует, что снег не мешает кликам по кнопкам и ссылкам.

## Установка

1. Штатным способом через админку.
    - [Скачиваем релиз](https://github.com/artikus11/art-snowfall/releases/latest/download/art-snowfall.zip)
    - В админке `Плагины → Добавить плагин → Кнопка "Загрузить плагин"`
2. Клон с GitHub
    ```markdown
    git clone https://github.com/your-repo/art-snowfall.git wp-content/plugins/art-snowfall
    ```
3. Установка с релиза
    ```markdown
   wp plugin install https://github.com/artikus11/art-snowfall/releases/latest/download/art-snowfall.zip --activate
   ```
4. Обновление с релиза через WP CLI
    ```markdown
   wp plugin install https://github.com/artikus11/art-snowfall/releases/latest/download/art-snowfall.zip --force
   ```

## Конфигурация

| Параметр | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `count` | `Number` | `100` | Базовый коэффициент плотности (умножается на площадь экрана). |
| `type` | `String` | `'lines'` | Примитив отрисовки: `'dot'` (круги), `'lines'` (снежинки из линий), `'star'` (8-конечные звезды). |
| `color` | `String` | `'#ffffff'` | Цвет снежинок в любом формате CSS (HEX, RGB, RGBA). |
| `minSize` | `Number` | `1` | Минимальный радиус/размер снежинки. |
| `maxSize` | `Number` | `3` | Максимальный радиус/размер снежинки. |
| `minSpeed` | `Number` | `0.5` | Минимальная скорость падения. |
| `maxSpeed` | `Number` | `2` | Максимальная скорость падения. |
| `zIndex` | `Number` | `9999` | Слой холста относительно других элементов сайта. |

---
### Тонкая настройка. Фильтр `art_snowfall_settings`

Фильтр позволяет изменить конфигурацию снега из вашей темы (`functions.php`) или другого плагина без правки исходного кода.

#### Пример 1: Изменение цвета и типа (на точки)

Если вы хотите классический мягкий снег вместо звезд:

```php
add_filter('art_snowfall_settings', function($settings) {
    $settings['type']  = 'dot';
    $settings['color'] = '#ffffff';
    $settings['count'] = 120; // Увеличим плотность
    return $settings;
});

```

#### Пример 2: Праздничная «Метель» (только для главной страницы)

Можно менять параметры в зависимости от контекста страницы:

```php
add_filter('art_snowfall_settings', function($settings) {
    if (is_front_page()) {
        $settings['minSpeed'] = 2.0;
        $settings['maxSpeed'] = 4.0;
        $settings['count']    = 250;
        $settings['color']    = '#d6e6ff';
    }
    return $settings;
});

```

#### Пример 3: Золотой снегопад (линии)

Стильный вариант для премиум-дизайна:

```php
add_filter('art_snowfall_settings', function($settings) {
    return array_merge($settings, [
        'type'    => 'lines',
        'color'   => '#FFD700', // Gold
        'minSize' => 1,
        'maxSize' => 2,
    ]);
});

```
#### Пример 4: Отключение на определенных типах постов

Если на вашем сайте есть типы постов, где снег неуместен (например, `portfolio` или `services`):

```php
add_filter( 'art_snowfall_settings', function( $settings ) {
    // Если это запись типа 'portfolio' — возвращаем false
    if ( is_singular( 'portfolio' ) ) {
        return false;
    }
    return $settings;
});

```

#### Пример 5: Отключение по ID страниц

Иногда нужно убрать эффект на конкретных страницах (например, «Контакты» или «Оплата»):

```php
add_filter( 'art_snowfall_settings', function( $settings ) {
    $excluded_ids = [ 12, 45, 102 ]; // ID страниц без снега
    
    if ( is_page( $excluded_ids ) ) {
        return false;
    }
    
    return $settings;
});

```

#### Пример 6: Отключение для мобильных устройств

Если вы хотите оставить снег только для десктопов, чтобы максимально сэкономить батарею мобильных пользователей:

```php
add_filter( 'art_snowfall_settings', function( $settings ) {
    if ( wp_is_mobile() ) {
        return false;
    }
    return $settings;
});

```


#### Пример 7: Снег только для «Ночного режима» сайта

Если на сайте есть переключатель темной темы, который вешает класс на `body`, включать снег вечером.

```php
add_filter('art_snowfall_settings', function($settings) {
    // Включаем снег только если сейчас вечер/ночь (по времени сервера)
    // Полезно для атмосферности, даже если есть кэш (ночной кэш обычно живет отдельно)
    $hour = (int) date('H');
    if ($hour < 18 && $hour > 8) {
        return false;
    }
    
    $settings['color'] = '#7dafff'; // Сделаем снег чуть голубоватым для ночи
    return $settings;
});

```

#### Пример 8: Разные настройки для разных разделов (Блог vs Лендинг)

На лендинге нам нужен легкий эффект, а в блоге можно устроить настоящую метель.

```php
add_filter('art_snowfall_settings', function($settings) {
    if ( is_home() || is_archive() ) {
        // Интенсивный снег для контентных страниц
        $settings['count'] = 180;
        $settings['maxSpeed'] = 3.0;
    } elseif ( is_front_page() ) {
        // Едва заметные "звезды" для главной, чтобы не перекрывать оффер
        $settings['count'] = 40;
        $settings['type'] = 'star';
        $settings['maxSize'] = 3;
    }
    
    return $settings;
});

```

#### Пример 9: Отключение снега для платных подписчиков / Авторизованных

Если хочешь сделать "чистый интерфейс" для тех, кто залогинен.

```php
add_filter('art_snowfall_settings', function($settings) {
    // Если пользователь авторизован — не грузим лишние скрипты
    if ( is_user_logged_in() ) {
        return false;
    }
    return $settings;
});

```

#### Пример 10: Адаптация под цвет бренда страницы

Если у категорий на сайте разные цвета (например, категория "Новый год" — красная, "Зима" — синяя), можно подкрашивать снег.

```php
add_filter('art_snowfall_settings', function($settings) {
    if ( is_category('holidays') ) {
        $settings['color'] = '#ffcfcf'; // Нежно-розовый снег
    }
    return $settings;
});

```

#### Пример 11: Снег только на страницах с определенным шаблоном

Если у тебя есть специальный Landing Page шаблон.

```php
add_filter('art_snowfall_settings', function($settings) {
    if ( ! is_page_template('templates/christmas-promo.php') ) {
        return false;
    }
    return $settings;
});

```

#### Пример 12: Снег на основе мета-поля страницы (ACF или Native Custom Fields)

Допустим, ты добавил в админке чекбокс «Включить снегопад на этой странице». Тогда фильтр будет выглядеть так:

```php
add_filter('art_snowfall_settings', function($settings) {
    // Проверяем только одиночные страницы и записи
    if ( is_singular() ) {
        // Получаем значение мета-поля (например, 'enable_snow')
        $is_snow_enabled = get_post_meta( get_the_ID(), 'enable_snow', true );
        
        // Если поле не отмечено — отключаем скрипт
        if ( ! $is_snow_enabled ) {
            return false;
        }
    }
    
    return $settings;
});

```
## Участие в разработке
Буду рад вашим Pull Requests! Если вы нашли баг или у вас есть идея по улучшению (например, новые типы частиц), пожалуйста, создайте [Issue](https://github.com/artikus11/art-snowfall/issues).

## Лицензия
Данный проект распространяется под лицензией MIT. Вы можете свободно использовать его в личных и коммерческих проектах.

## Автор
Разработано с [❤️](https://github.com/artikus11).
Если вам понравился плагин, вы можете поставить ⭐ этому репозиторию.