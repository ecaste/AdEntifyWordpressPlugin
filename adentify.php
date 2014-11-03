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

define( 'ADENTIFY_URL', 'https://local.adentify.com/%s');
define( 'ADENTIFY_API_ROOT_URL', sprintf(ADENTIFY_URL, 'api/v1/%s') );
define( 'ADENTIFY_TOKEN_URL', sprintf(ADENTIFY_URL, 'oauth/v2/token'));
define( 'ADENTIFY_AUTHORIZATION_URL', sprintf(ADENTIFY_URL, 'oauth/v2/auth'));
define( 'ADENTIFY__PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ADENTIFY__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ADENTIFY__PLUGIN_SETTINGS', serialize(array(
    'IS_PRIVATE' => 'photoIsPrivate',
    'USE_DATABASE' => 'adentifyDatabase',
    'TAGS_VISIBILITY' => 'tagsVisibility',
    'TAGS_SHAPE' => 'tagShape'
)));
define( 'ADENTIFY_PLUGIN_SETTINGS_PAGE_NAME', 'adentify_plugin_submenu');
define( 'ADENTIFY_REDIRECT_URI', admin_url(sprintf('options-general.php?page=%s', ADENTIFY_PLUGIN_SETTINGS_PAGE_NAME)) );
define( 'ADENTIFY_ADMIN_URL', admin_url('admin-ajax.php'));
define( 'ADENTIFY_API_CLIENT_NAME', sprintf('plugin_wordpress_%s', $_SERVER['HTTP_HOST']));
define( 'ADENTIFY_API_CLIENT_ID_KEY', 'api_client_id');
define( 'ADENTIFY_API_CLIENT_SECRET_KEY', 'api_client_secret');
define( 'ADENTIFY_API_ACCESS_TOKEN', 'api_access_token');
define( 'ADENTIFY_API_REFRESH_TOKEN', 'api_refresh_token');
define( 'ADENTIFY_API_EXPIRES_TIMESTAMP', 'api_expires_timestamp');
define( 'PLUGIN_VERSION', '1.0.0');
define( 'ADENTIFY_SQL_TABLE_PHOTOS', 'adentify_photos');

require 'vendor/autoload.php';
require_once( ADENTIFY__PLUGIN_DIR . 'public/APIManager.php' );
require_once( ADENTIFY__PLUGIN_DIR . 'public/DBManager.php' );
require_once( ADENTIFY__PLUGIN_DIR . 'public/Photo.php' );
require_once( ADENTIFY__PLUGIN_DIR . 'public/Tag.php' );
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
	add_options_page( 'Adentify settings', 'Adentify settings', 'manage_options', ADENTIFY_PLUGIN_SETTINGS_PAGE_NAME, 'adentify_plugin_settings' );
}

function adentify_plugin_settings() {
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}

    if (isset($_GET['code'])) {
        APIManager::getInstance()-> getAccessTokenWithAuthorizationCode($_GET['code']);
    }

    $checkPostHidden = 'checkPostHidden';
    $settings = array();
    $parameters = array('checkPostHidden' => 'checkPostHidden');
    foreach(unserialize(ADENTIFY__PLUGIN_SETTINGS) as $key)
        $settings[$key] = get_option($key);

    if (isset($_POST[$checkPostHidden]) && $_POST[$checkPostHidden] == 'Y') {
        foreach(unserialize(ADENTIFY__PLUGIN_SETTINGS) as $key)
        {
            $settings[$key] = (isset($_POST[$key])) ? $_POST[$key] : null;
            update_option($key, $settings[$key]);
        }
        echo '<div class="updated"><p><strong>Settings saved.</strong></p></div>';

        wp_localize_script('adentify-tags-js', 'adentifyTagsData', array(
            'admin_ajax_url' => ADENTIFY_ADMIN_URL,
            'tag_shape' => get_option(unserialize(ADENTIFY__PLUGIN_SETTINGS)['TAGS_SHAPE'])
        ));
    }
    foreach($settings as $key => $value)
    {
        $parameters[$key.'Val'] = $value;
        $parameters[$key] = $key;
    }

    if (!APIManager::getInstance()->getAccessToken())
        $parameters['authorization_url'] = APIManager::getInstance()->getAuthorizationUrl();

    echo Twig::render('adentify.settings.html.twig', $parameters);
}

function adentify_button($editor_id = 'content') {
    //displays the button
    printf( '<a href="#" id="adentify-upload-img" class="button add_media" data-editor="%s" title="%s">%s</a>',
        esc_attr( $editor_id ),
        esc_attr__( 'Upload images with AdEntify plugin' ),
        'AdEntify'
    );
    echo Twig::render('admin\modals\upload.modal.html.twig', array(
        'photos' => DBManager::getInstance()->getPhotos()
    ));
    echo Twig::render('admin\modals\tag.modal.html.twig', array());
}
add_action( 'media_buttons', 'adentify_button' );

/* CSS and JS files */
function wptuts_styles_with_the_lot()
{
    // Register the style like this for a plugin:
    wp_register_style( 'adentify-tags-style', plugins_url( '/css/adentify-tags.css', __FILE__ ), array(), PLUGIN_VERSION, 'all' );

    // For either a plugin or a theme, you can then enqueue the style:
    wp_enqueue_style( 'adentify-tags-style' );

    // Register the script like this for a plugin:
    wp_register_script( 'adentify-tags-js', plugins_url( '/js/adentify-tags.js', __FILE__ ), array('jquery'), PLUGIN_VERSION, 'all');

    wp_localize_script('adentify-tags-js', 'adentifyTagsData', array(
        'admin_ajax_url' => ADENTIFY_ADMIN_URL,
        'tag_shape' => get_option(unserialize(ADENTIFY__PLUGIN_SETTINGS)['TAGS_SHAPE'])
    ));

    // For either a plugin or a theme, you can then enqueue the script:
    wp_enqueue_script( 'adentify-tags-js' );
}
function wptuts_admin_styles_with_the_lot() {
    // Register the style like this for a plugin:
    wp_register_style( 'adentify-admin-style', plugins_url( '/css/adentify.admin.css', __FILE__ ), array(), PLUGIN_VERSION, 'all' );

    // For either a plugin or a theme, you can then enqueue the style:
    wp_enqueue_style( 'adentify-admin-style' );
}
add_action( 'wp_enqueue_scripts', 'wptuts_styles_with_the_lot' );
add_action( 'admin_enqueue_scripts', 'wptuts_styles_with_the_lot' );
add_action( 'admin_enqueue_scripts', 'wptuts_admin_styles_with_the_lot' );

function adentify_register_attachments_tax()
{
    register_taxonomy( 'adentify-category', 'attachment',
        array(
            'labels' =>  array(
                'name'              => 'Plugin',
                'singular_name'     => 'Plugin',
                'search_items'      => 'Search plugin Categories',
                'all_items'         => 'All Plugin Categories',
                'edit_item'         => 'Edit Plugin Categories',
                'update_item'       => 'Update Plugin Category',
                'add_new_item'      => 'Add New Plugin Category',
                'new_item_name'     => 'New Plugin Category Name',
                'menu_name'         => 'Plugin',
            ),
            'hierarchical' => true,
            'sort' => true,
            'show_admin_column' => true
        )
    );
}
add_action( 'init', 'adentify_register_attachments_tax', 0 );

/* AdEntify plugin activated */
function adentify_activated() {

    APIManager::getInstance()->registerPluginClient();

    // Database config
    global $wpdb;
    $table_name = $wpdb->prefix . ADENTIFY_SQL_TABLE_PHOTOS;

    /*
     * We'll set the default character set and collation for this table.
     * If we don't do this, some characters could end up being converted
     * to just ?'s when saved in our table.
    */
    $charset_collate = '';

    if ( ! empty( $wpdb->charset ) ) {
        $charset_collate = "DEFAULT CHARACTER SET {$wpdb->charset}";
    }

    if ( ! empty( $wpdb->collate ) ) {
        $charset_collate .= " COLLATE {$wpdb->collate}";
    }

    $sql = "CREATE TABLE $table_name (
      id bigint(20) NOT NULL AUTO_INCREMENT,
      time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
      wordpress_photo_id bigint(20) NOT NULL,
      adentify_photo_id bigint(20) NOT NULL,
      thumb_url text NOT NULL,
      UNIQUE KEY id (id)
    ) $charset_collate;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
}
register_activation_hook( __FILE__, 'adentify_activated' );

function ad_upload() {
    if (APIManager::getInstance()->getAccessToken())
    {
        // upload the file in the upload folder
        $upload = wp_upload_bits($_FILES["ad-upload-img"]["name"], null, file_get_contents($_FILES["ad-upload-img"]["tmp_name"]));

        if (!empty($upload))
        {
            // $filename should be the path to a file in the upload directory.
            $filename = $upload['file'];

            // The ID of the post this attachment is for.
            $parent_post_id = 0;

            // Check the type of tile. We'll use this as the 'post_mime_type'.
            $filetype = wp_check_filetype( basename( $filename ), null );

            // Get the path to the upload directory.
            $wp_upload_dir = wp_upload_dir();

            // Prepare an array of post data for the attachment.
            $attachment = array(
                'guid'           => $wp_upload_dir['url'] . '/' . basename( $filename ),
                'post_mime_type' => $filetype['type'],
                'post_title'     => preg_replace( '/\.[^.]+$/', '', basename( $filename ) ),
                'post_content'   => '',
                'post_status'    => 'inherit'
            );

            // Insert the attachment.
            $attach_id = wp_insert_attachment( $attachment, $filename, $parent_post_id );

            // Make sure that this file is included, as wp_generate_attachment_metadata() depends on it.
            require_once( ABSPATH . 'wp-admin/includes/image.php' );

            // Generate the metadata for the attachment, and update the database record.
            $attach_data = wp_generate_attachment_metadata( $attach_id, $filename );
            wp_update_attachment_metadata( $attach_id, $attach_data );

            // Set the AdEntify category to the new image
            if ($attach_id)
                wp_set_object_terms( $attach_id, array('AdEntify'), 'adentify-category', true );

            $photo = new Photo();
            if ($result = APIManager::getInstance()->postPhoto($photo, fopen($_FILES['ad-upload-img']['tmp_name'], 'r'))->json())
            {
                $photo->setSmallUrl($result['small_url']);
                $photo->setId($result['id']);
                DBManager::getInstance()->insertPhoto($photo, $attach_id);
                wp_send_json_success($result);
            }
            else
                wp_send_json_error("unknown error");
        }
    }
    else
        wp_send_json_error("status code: 401 Unauthorized");
}
add_action( 'wp_ajax_ad_upload', 'ad_upload' );

function ad_tag() {
    $tag = Tag::loadPost($_POST['tag']);
    echo APIManager::getInstance()->postTag($tag)->getBody();
    exit();
}
add_action( 'wp_ajax_ad_tag', 'ad_tag' );

function ad_get_photo() {
    wp_send_json_success(sprintf(APIManager::getInstance()->getPhoto($_GET['photo_id'])));
}
add_action( 'wp_ajax_ad_get_photo', 'ad_get_photo' );