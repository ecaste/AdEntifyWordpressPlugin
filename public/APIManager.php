<?php
/**
 * Created by PhpStorm.
 * User: pierrickmartos
 * Date: 10/10/2014
 * Time: 12:02
 */

class APIManager
{
    protected $client = null;
    protected static $instance = null;

    public function __construct()
    {
        $this->client = new GuzzleHttp\Client();
    }

    public static function getInstance()
    {
        if (!self::$instance)
            self::$instance = new APIManager();

        return self::$instance;
    }

    public function getPhoto($id)
    {
        return $this->getAction(sprintf('photos/%s', $id));
    }

    public function postPhoto(Photo $photo)
    {
        return $this->postAction('photo', $photo->serialize());
    }

    public function deletePhoto($id)
    {
        return $this->deleteAction( sprintf('photos/%s', $id));
    }

    public function postTag(Tag $tag)
    {
        return $this->postAction('tag', $tag->serialize());
    }

    public function deleteTag($id)
    {
        return $this->deleteAction( sprintf('tags/%s', $id));
    }

    /**
     * GET action on the API
     *
     * @param $url
     * @return bool
     */
    private function getAction($url) {
        try {
            $response = $this->client->get(sprintf(ADENTIFY_API_ROOT_URL, $url));
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
            $response = $this->client->delete(sprintf(ADENTIFY_API_ROOT_URL, $url));
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
    private function postAction($url, $options)
    {
        try {
            $response = $this->client->post(sprintf(ADENTIFY_API_ROOT_URL, $url), $options);
            return $response->getStatusCode() == 200;
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            return false;
        }
    }
} 