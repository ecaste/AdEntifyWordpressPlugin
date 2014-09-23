<?php

/* photo.html.twig */
class __TwigTemplate_a5744d014d9930f7623791fa7f07fd5cfaf8334b3de8a24ba600db11f40ab8cc extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<img src=\"";
        echo twig_escape_filter($this->env, (isset($context["imageUrl"]) ? $context["imageUrl"] : null), "html", null, true);
        echo "\" />
<a href=\"";
        // line 2
        echo twig_escape_filter($this->env, (isset($context["link"]) ? $context["link"] : null), "html", null, true);
        echo "\">";
        echo twig_escape_filter($this->env, (isset($context["caption"]) ? $context["caption"] : null), "html", null, true);
        echo "</a>";
    }

    public function getTemplateName()
    {
        return "photo.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  24 => 2,  19 => 1,);
    }
}
