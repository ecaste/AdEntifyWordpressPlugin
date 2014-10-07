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
define( 'ADENTIFY_API_ROOT_URL', 'https://adentify.com/api/v1/%s' );
define( 'ADENTIFY__PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ADENTIFY__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ADENTIFY__PLUGIN_SETTINGS', serialize(array(
    'IS_PRIVATE' => 'photoIsPrivate',
    'USE_DATABASE' => 'adentifyDatabase',
    'TAGS_VISIBILITY' => 'tagsVisibility')));

require 'vendor/autoload.php';
require_once( ADENTIFY__PLUGIN_DIR . 'public/Photo.php' );
require_once( ADENTIFY__PLUGIN_DIR . 'public/Twig.php' );

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
	add_options_page( 'Adentify settings', 'Adentify settings', 'manage_options', 'adentify_plugin_submenu', 'adentify_plugin_settings' );
}

function adentify_plugin_settings() {
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}

    $checkPostHidden = 'checkPostHidden';
    $settings = array();
    $twig_variable = array('checkPostHidden' => 'checkPostHidden');
    foreach(unserialize(ADENTIFY__PLUGIN_SETTINGS) as $key)
        $settings[$key] = get_option($key);

    if (isset($_POST[$checkPostHidden]) && $_POST[$checkPostHidden] == 'Y') {
        foreach(unserialize(ADENTIFY__PLUGIN_SETTINGS) as $key)
        {
            $settings[$key] = (isset($_POST[$key])) ? $_POST[$key] : null;
            update_option($key, $settings[$key]);
        }
        ?>
        <div class="updated"><p><strong>Settings saved.</strong></p></div>
    <?php
    }
    foreach($settings as $key => $value)
    {
        $twig_variable[$key.'Val'] = $value;
        $twig_variable[$key] = $key;
    }
    echo Twig::render('adentify.settings.html.twig', $twig_variable);
}