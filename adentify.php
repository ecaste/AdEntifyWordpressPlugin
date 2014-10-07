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
<<<<<<< HEAD
define( 'ADENTIFY__PLUGIN_SETTINGS', serialize(array(
    'IS_PRIVATE' => 'photoIsPrivate',
    'USE_DATABASE' => 'adentifyDatabase',
    'TAGS_VISIBILITY' => 'tagsVisibility')));
=======
>>>>>>> parent of bd09d48... Factorisation du code

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
	add_options_page( 'Adentify settings', 'Adentify settings', 'manage_options', 'adentify_plugin_submenu', 'adentify_plugin_settings' );
}

function adentify_plugin_settings() {
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}

<<<<<<< HEAD
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
=======
    $checkPostHidden = 'check_post_hidden';
    $photoIsPrivate = 'photo-is-private';
    $adEntifyDatabase = 'adentify-database';
    $tagsVisibility = 'tags-visibility';


    // Read in existing option value from database
    $photoIsPrivate_val = get_option($photoIsPrivate);
    $adEntifyDatabase_val = get_option($adEntifyDatabase);
    $tagsVisibility_val = get_option($tagsVisibility);

    // See if the user has posted us some information
    // If they did, this hidden field will be set to 'Y'
    if( isset($_POST[$checkPostHidden]) && $_POST[$checkPostHidden] == 'Y' ) {
        $photoIsPrivate_val = $_POST[$photoIsPrivate];
        $adEntifyDatabase_val = $_POST[$adEntifyDatabase];
        $tagsVisibility_val = $_POST[$tagsVisibility];

        // Save the posted value in the database
        update_option($photoIsPrivate, $photoIsPrivate_val);
        update_option($adEntifyDatabase, $adEntifyDatabase_val);
        update_option($tagsVisibility, $tagsVisibility_val);

        // Put an settings updated message on the screen

>>>>>>> parent of bd09d48... Factorisation du code
        ?>
        <div class="updated"><p><strong><?php _e('settings saved.', 'menu-test' ); ?></strong></p></div>
    <?php

    }

	$loader = new Twig_Loader_Filesystem(ADENTIFY__PLUGIN_DIR . 'templates');
	$twig = new Twig_Environment($loader, array(
		'cache' => WP_DEBUG ? false : ADENTIFY__PLUGIN_DIR . 'cache/templates',
	));
	$template = $twig->loadTemplate('adentify.settings.html.twig');
	echo $template->render(array(
        'photo-is-private' => $photoIsPrivate,
        'adentify-database' => $adEntifyDatabase,
        'tags-visibility' => $tagsVisibility,
        'check-post-hidden' => $checkPostHidden,
        'photo-is-private-val' => $photoIsPrivate_val,
        'adentidy-database-val' => $adEntifyDatabase_val,
        'tags-visibility-val' => $tagsVisibility_val,
    ));
}

// Hook for adding admin menus
add_action('admin_menu', 'mt_add_pages');

// action function for above hook
function mt_add_pages()
{
    // Add a new submenu under Settings:
    add_options_page(__('Test Settings', 'menu-test'), __('Test Settings', 'menu-test'), 'manage_options', 'testsettings', 'mt_settings_page');
}

// mt_settings_page() displays the page content for the Test settings submenu
function mt_settings_page() {

    //must check that the user has the required capability
    if (!current_user_can('manage_options'))
    {
        wp_die( __('You do not have sufficient permissions to access this page.') );
    }

    // variables for the field and option names
    $opt_name = 'mt_favorite_color';
    $hidden_field_name = 'mt_submit_hidden';
    $data_field_name = 'mt_favorite_color';

    // Read in existing option value from database
    $opt_val = get_option( $opt_name );

    // See if the user has posted us some information
    // If they did, this hidden field will be set to 'Y'
    if( isset($_POST[ $hidden_field_name ]) && $_POST[ $hidden_field_name ] == 'Y' ) {
        // Read their posted value
        $opt_val = $_POST[ $data_field_name ];

        // Save the posted value in the database
        update_option( $opt_name, $opt_val );

        // Put an settings updated message on the screen

        ?>
        <div class="updated"><p><strong><?php _e('settings saved.', 'menu-test' ); ?></strong></p></div>
    <?php

    }
<<<<<<< HEAD
    echo Twig::render('adentify.settings.html.twig', $twig_variable);
=======

    // Now display the settings editing screen

    echo '<div class="wrap">';

    // header

    echo "<h2>" . __( 'Menu Test Plugin Settings', 'menu-test' ) . "</h2>";

    // settings form

    ?>

    <form name="form1" method="post" action="">
        <input type="hidden" name="<?php echo $hidden_field_name; ?>" value="Y">

        <p><?php _e("Favorite Color:", 'menu-test' ); ?>
            <input type="text" name="<?php echo $data_field_name; ?>" value="<?php echo $opt_val; ?>" size="20">
        </p><hr />

        <p class="submit">
            <input type="submit" name="Submit" class="button-primary" value="<?php esc_attr_e('Save Changes') ?>" />
        </p>

    </form>
    </div>

<?php

>>>>>>> parent of bd09d48... Factorisation du code
}