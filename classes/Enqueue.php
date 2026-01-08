<?php

namespace Art\Snowfall;

class Enqueue {

	protected Main $main;


	/**
	 * @var string[]
	 */
	protected array $handles;


	protected string $suffix;


	public function __construct( $main ) {

		$this->main   = $main;
		$this->suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		$this->handles = [
			'script' => Utils::get_plugin_prefix() . '-public-script',
		];
	}


	public function init_hooks(): void {

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ], 100 );
	}


	public function has_woocommerce(): bool {

		if ( class_exists( 'Woocommerce' ) ) {
			return is_woocommerce() || is_cart() || is_checkout() || is_account_page();
		}

		return false;
	}


	/**
	 * Подключаем нужные стили и скрипты
	 */
	public function enqueue(): void {

		if ( is_admin() || $this->has_woocommerce() ) {
			return;
		}

		wp_enqueue_script(
			$this->handles['script'],
			sprintf( '%s/assets/js/%s%s.js', Utils::get_plugin_url(), $this->handles['script'], $this->suffix ),
			[],
			Utils::get_plugin_version(),
			[
				'in_footer'     => true,
				'strategy'      => 'defer',
				'fetchpriority' => 'low',
			]
		);

		$settings = apply_filters(
			'art_snowfall_settings',
			[
				'count'    => 100,
				'type'     => 'star',
				'color'    => '#e9f1fc',
				'minSize'  => 2,
				'maxSize'  => 6,
				'minSpeed' => 0.4,
				'maxSpeed' => 1.9,
			]
		);

		wp_add_inline_script(
			$this->handles['script'],
			'window.snowSettings = ' . wp_json_encode( $settings ) . ';',
			'before'
		);
	}
}
