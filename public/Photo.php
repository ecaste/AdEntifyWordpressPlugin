<?php
/**
 * Created by PhpStorm.
 * User: pierrickmartos
 * Date: 23/09/2014
 * Time: 16:09
 */

class Photo
{
    protected $client;
    protected $id;
    protected $json;

    public function __construct($id)
    {
        $this->id = $id;
        $this->client = new GuzzleHttp\Client();
    }

    public function load()
    {
        $response = $this->client->get(sprintf(ADENTIFY_API_ROOT_URL, sprintf('photos/%s', $this->id)));
        if ($response->getStatusCode() == 200) {
            $this->setJson($response->getBody());
        }
    }

    public function render()
    {
        $loader = new Twig_Loader_Filesystem(ADENTIFY__PLUGIN_DIR . 'templates');
        $twig = new Twig_Environment($loader, array(
            'cache' => ADENTIFY__PLUGIN_DIR . 'cache/templates',
        ));
        $template = $twig->loadTemplate('photo.html.twig');
        return $template->render(array(
            'link' => $this->getLink(),
            'imageUrl' => $this->getImageUrl(),
            'caption' => $this->getCaption()
        ));
    }

    public function getLink()
    {
        // TODO: add language config
        return sprintf('https://adentify.com/en/app/photo/%s/', $this->getId());
    }

    public function getImageUrl()
    {
        return $this->getJson()->large_url;
    }

    public function getCaption()
    {
        return $this->getJson()->caption;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return mixed
     */
    public function getJson()
    {
        return $this->json;
    }

    /**
     * @param mixed $json
     */
    public function setJson($json)
    {
        $this->json = json_decode($json);
        return $this;
    }
}