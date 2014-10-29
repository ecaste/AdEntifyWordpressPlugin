<?php
/**
 * Created by PhpStorm.
 * User: pierrickmartos
 * Date: 10/10/2014
 * Time: 12:02
 */
use GuzzleHttp\Post\PostFile;

class APIManager
{
    protected $client = null;
    protected $config = array();
    protected static $instance = null;

    public function __construct()
    {
        $this->client = new GuzzleHttp\Client();
        $this->config = array(
            'curl' => array(
                CURLOPT_SSL_VERIFYPEER => !WP_DEBUG,
            )
        );
    }

    public static function getInstance()
    {
        if (!self::$instance)
            self::$instance = new APIManager();

        return self::$instance;
    }

    /**
     * Get a photo by ID
     *
     * @param $id
     * @return bool
     */
    public function getPhoto($id)
    {
        return $this->getAction(sprintf('photos/%s', $id));
    }

    /**
     * Post a photo
     *
     * @param Photo $photo
     * @param $fileStream
     * @return bool
     */
    public function postPhoto(Photo $photo, $fileStream)
    {
        return $this->postAction('photo', array(
            'photo' => $photo->serialize(array(
                '_token' => $this->getCsrfToken('photo_item')
            )),
            'file' => new PostFile('file', $fileStream)
        ), $this->getAuthorizationHeader());
    }

    /**
     * Delete a photo by ID
     *
     * @param $id
     * @return int
     */
    public function deletePhoto($id)
    {
        return $this->deleteAction( sprintf('photos/%s', $id));
    }

    /**
     * Post tag
     *
     * @param Tag $tag
     * @return bool
     *
     */
    public function postTag(Tag $tag)
    {
        return $this->postAction('tag', $tag->serialize(array('_token' => $this->getCsrfToken('tag_item'))));
    }

    /**
     * Delete a tag by ID
     *
     * @param $id
     * @return int
     */
    public function deleteTag($id)
    {
        return $this->deleteAction( sprintf('tags/%s', $id));
    }

    /**
     * Register plugin
     */
    public function registerPluginClient()
    {
        $response = $this->postAction('client', array(
            'client' => array(
                /*'_token' => $json->csrf_token,*/
                'name' => ADENTIFY_API_CLIENT_NAME,
                'displayName' => 'Plugin Wordpress AdEntify',
                'redirectUris' => array(ADENTIFY_REDIRECT_URI)
            )
        ));
        if ($response) {
            $json = json_decode($response->getBody());
            update_option(ADENTIFY_API_CLIENT_ID_KEY, $json->id);
            update_option(ADENTIFY_API_CLIENT_SECRET_KEY, $json->secret);
        }
    }

    /**
     * Get access token with authorization code
     *
     * @param $code
     * @return bool
     */
    public function getAccessTokenWithAuthorizationCode($code)
    {
        $response = $this->postAction(null, array(
            'client_id' => get_option(ADENTIFY_API_CLIENT_ID_KEY),
            'client_secret' => get_option(ADENTIFY_API_CLIENT_SECRET_KEY),
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => ADENTIFY_REDIRECT_URI
        ), array(), ADENTIFY_TOKEN_URL);
        if ($response) {
            $json = json_decode($response->getBody());
            if (isset($json->access_token)) {
                update_option(ADENTIFY_API_ACCESS_TOKEN, $json->access_token);
                update_option(ADENTIFY_API_REFRESH_TOKEN, $json->refresh_token);
                update_option(ADENTIFY_API_EXPIRES_TIMESTAMP, strtotime(sprintf('+%s second', $json->expires_in)));
            } else
                return false;
        } else
            return false;
    }

    /**
     * Get saved access token
     *
     * @return bool|mixed|void
     */
    public function getAccessToken()
    {
        if (!get_option(ADENTIFY_API_ACCESS_TOKEN) || (get_option(ADENTIFY_API_EXPIRES_TIMESTAMP) && get_option(ADENTIFY_API_EXPIRES_TIMESTAMP) < time())) {
            return false;
        }

        return get_option(ADENTIFY_API_ACCESS_TOKEN);
    }

    /**
     * Get authorization url to get authorization code
     *
     * @return string
     */
    public function getAuthorizationUrl()
    {
        return sprintf('%s?%s', ADENTIFY_AUTHORIZATION_URL, http_build_query(array(
            'client_id' => get_option(ADENTIFY_API_CLIENT_ID_KEY),
            'redirect_uri' => ADENTIFY_REDIRECT_URI,
            'response_type' => 'code'
        )));
    }

    private function getAuthorizationHeader()
    {
        $accessToken = $this->getAccessToken();
        return $accessToken ? array(
            'Authorization' => sprintf('Bearer %s', $accessToken)
        ) : array();
    }

    private function getCsrfToken($intention)
    {
        try {
            $response = $this->getAction(sprintf('csrftokens/%s', $intention));
            $json = json_decode($response);
            return isset($json->csrf_token) ? $json->csrf_token : false;
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            return false;
        }
    }

    /**
     * GET action on the API
     *
     * @param $url
     * @return bool
     */
    private function getAction($url, $rootUrl = ADENTIFY_API_ROOT_URL) {
        try {
            $response = $this->client->get(sprintf($rootUrl, $url), array(
                'headers' => $this->getAuthorizationHeader(),
                'config' => $this->config,
                'cookies' => true,
            ));
            if ($response->getStatusCode() == 200) {
                return $response->getBody();
            } else
                return false;
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            return false;
        }
    }

    /**
     * DELETE action on the API
     *
     * @param $url
     * @return int
     */
    private function deleteAction($url) {
        try {
            $response = $this->client->delete(sprintf(ADENTIFY_API_ROOT_URL, $url), array(
                'headers' => $this->getAuthorizationHeader(),
                'config' => $this->config,
                'cookies' => true,
            ));
            return $response->getStatusCode() == 200 || $response->getStatusCode() == 204;
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            return false;
        }
    }

    /**
     * POST data to the API
     *
     * @param $url
     * @param $options
     * @return bool
     */
    private function postAction($url, $body = array(), $headers = array(), $rootUrl = ADENTIFY_API_ROOT_URL)
    {
        try {
            $response = $this->client->post(sprintf($rootUrl, $url), array(
                'body' => $body,
                'headers' => $this->getAuthorizationHeader(),
                'config' => $this->config,
                'cookies' => true,
            ));

            return $response->getStatusCode() == 200 ? $response : false;
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            return false;
        }
    }
}