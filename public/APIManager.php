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

    public function __construct()
    {
        $this->client = new GuzzleHttp\Client();
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
     * DELETE action on the API
     *
     * @param $url
     * @return int
     */
    private function deleteAction($url) {
        $response = $this->client->delete(sprintf(ADENTIFY_API_ROOT_URL, $url));
        return $response->getStatusCode() == 200 || $response->getStatusCode() == 204;
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
        $response = $this->client->post(sprintf(ADENTIFY_API_ROOT_URL, $url), $options);
        return $response->getStatusCode() == 200;
    }
} 