<?php
/**
 * Plugin Name: Art SnowFall
 * Plugin URI: wpruse.ru
 * Text Domain:
 * Domain Path: /languages
 * Description: Плагин вывода снега на сайте.
 * Version: 1.1.0
 * Author: Artem Abramovich
 * Author URI: https://wpruse.ru/
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * RequiresWP: 6.4
 * RequiresPHP: 7.4
 *
 */

const ASF_PLUGIN_DIR    = __DIR__;
const ASF_PLUGIN_AFILE  = __FILE__;
const ASF_PLUGIN_VER    = '1.1.0';
const ASF_PLUGIN_NAME   = 'SnowFall';
const ASF_PLUGIN_SLUG   = 'art-snowfall';
const ASF_PLUGIN_PREFIX = 'asf';

define( 'ASF_PLUGIN_URI', untrailingslashit( plugin_dir_url( ASF_PLUGIN_AFILE ) ) );
define( 'ASF_PLUGIN_FILE', plugin_basename( __FILE__ ) );
require ASF_PLUGIN_DIR . '/vendor/autoload.php';

( new \Art\Snowfall\Main() )->init();
