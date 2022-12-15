<?php
/**
 * Plugin Name: Art SnowFall
 * Plugin URI: wpruse.ru
 * Text Domain:
 * Domain Path: /languages
 * Description:
 * Version: 1.0.0
 * Author: Artem Abramovich
 * Author URI: https://wpruse.ru/
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * WC requires at least: 3.3.0
 * WC tested up to: 3.6
 *
 */

namespace Art\Snowfall;

class Snowfall {

	public function hooks() {

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );
		add_action( 'wp_footer', [ $this, 'out' ] );
	}


	public function has_woocommerce() {

		if ( class_exists( 'Woocommerce' ) ) {
			return is_woocommerce() || is_cart() || is_checkout() || is_account_page();
		}

		return false;
	}


	public function enqueue() {

		if ( $this->has_woocommerce() ) {
			return;
		}

		wp_enqueue_style(
			'snowfall-style',
			plugin_dir_url( __FILE__ ) . 'assets/snowfallstyles.css',
			[],
			filemtime( plugin_dir_path( __FILE__ ) . 'assets/snowfallstyles.css' )
		);

		wp_enqueue_script(
			'snowfall-script',
			plugin_dir_url( __FILE__ ) . 'assets/snowfall.jquery.min.js',
			[ 'jquery', 'jquery-ui-draggable' ],
			filemtime( plugin_dir_path( __FILE__ ) . 'assets/snowfall.jquery.min.js' ),
			true
		);

		wp_localize_script(
			'snowfall-script',
			'snowfall_object',
			[
				'image_ulr' => plugin_dir_url( __FILE__ ) . 'assets/images/snowflake-shadow.svg',
			]
		);
	}


	public function out() {

		if ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() ) {
			return;
		}

		?>
		<script type="text/javascript">
			jQuery( document ).ready( function ( $ ) {
				$( document ).snowfall( {
					flakeCount: 300,
					image:      snowfall_object.image_ulr,
					minSize:    5,
					maxSize:    10,
					round:      true,
					shadow:     false
				} );
			} );

		</script>
		<?php
	}

}

( new Snowfall() )->hooks();