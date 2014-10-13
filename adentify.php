<?php
/*
 * Plugin Name: AdEntify
 * Plugin URI: http://wordpress.adentify.com
 * Description: A brief description of the Plugin.
 * Version: 1.0.0
 * Author: ValYouAd
 * Author URI: http://www.valyouad.com
 * License: GPL2
 */

/*  Copyright 2014  ValYouAd

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

defined('ABSPATH') or die("No script kiddies please!");
define( 'ADENTIFY_API_ROOT_URL', 'https://dev.adentify.com/api/v1/%s' );
define( 'ADENTIFY__PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ADENTIFY__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PLUGIN_VERSION', '1.0.0');

require 'vendor/autoload.php';
require_once( ADENTIFY__PLUGIN_DIR . 'public/Photo.php' );

add_filter( 'content_edit_pre', 'filter_function_name', 10, 2 );
function filter_function_name( $content, $post_id ) {

    preg_match('/\[adentify=(.+)\]/i', $content, $matches);
    if (isset($matches[1])) {

    }

    return $content;
}

add_filter( 'the_content', 'my_the_content_filter', 20 );
/**
 * Add a icon to the beginning of every post page.
 *
 * @uses is_single()
 */
function my_the_content_filter( $content ) {

    if ( is_single() ) {
        preg_match('/\[adentify=(.+)\]/i', $content, $matches);
        if (isset($matches[1])) {
            $photoId = $matches[1];

            $photo = new Photo($photoId);
            $photo->load();

            $content = preg_replace('/\[adentify=(.+)\]/i', $photo->render(), $content);
        }
    }

    // Returns the content.
    return $content;
}

add_action( 'admin_menu', 'adentify_setting_menu' );

function adentify_setting_menu() {
	add_options_page( 'Adentify settings', 'Adentify settings', 'manage_options', 'adentify_plugin_settings', 'adentify_plugin_settings' );
}

function adentify_plugin_settings() {
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}

	$loader = new Twig_Loader_Filesystem(ADENTIFY__PLUGIN_DIR . 'templates');
	$twig = new Twig_Environment($loader, array(
		'cache' => ADENTIFY__PLUGIN_DIR . 'cache/templates',
	));
	$template = $twig->loadTemplate('adentify.settings.html.twig');
	echo $template->render(array());
}

/* CSS and JS files */
function wptuts_styles_with_the_lot()
{
    // Register the style like this for a plugin:
    wp_register_style( 'adentify-tags-style', plugins_url( '/css/adentify-tags.css', __FILE__ ), array(), PLUGIN_VERSION, 'all' );

    // For either a plugin or a theme, you can then enqueue the style:
    wp_enqueue_style( 'adentify-tags-style' );

    // Register the script like this for a plugin:
    wp_register_script( 'adentify-tags-js', plugins_url( '/js/adentify-tags.js', __FILE__ ), array('jquery'), PLUGIN_VERSION, 'all');

    // For either a plugin or a theme, you can then enqueue the script:
    wp_enqueue_script( 'adentify-tags-js' );
}
add_action( 'wp_enqueue_scripts', 'wptuts_styles_with_the_lot' );