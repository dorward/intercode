class MarkdownPresenter
  ALLOWED_LIQUID_NODE_CLASSES = [String, Intercode::Liquid::Tags::Youtube]

  include ActionView::Helpers::SanitizeHelper
  include ActionView::Helpers::TextHelper

  def self.markdown_processor
    @markdown_processor ||= Redcarpet::Markdown.new(
      Redcarpet::Render::HTML.new(link_attributes: { target: '_blank', rel: 'noreferrer' }),
      no_intra_emphasis: true,
      autolink: true
    )
  end

  def self.strip_single_p(html)
    fragment = Nokogiri::HTML::DocumentFragment.parse(html)
    non_blank_children = fragment.children.reject { |child| child.text? && child.content.blank? }

    if non_blank_children.size == 1 && non_blank_children.first.name == 'p'
      non_blank_children.first.inner_html.html_safe
    else
      html
    end
  end

  attr_reader :default_content, :cadmus_renderer

  def initialize(default_content, cadmus_renderer: nil)
    @default_content = default_content
    @cadmus_renderer = cadmus_renderer
  end

  def render(markdown, sanitize_content: true, strip_single_p: true, whitelist_liquid_tags: true)
    rendered_liquid = render_liquid(markdown, whitelist_liquid_tags: whitelist_liquid_tags)

    rendered_html = MarkdownPresenter.markdown_processor.render(rendered_liquid || '')
    sanitized_html = sanitize_html(rendered_html, sanitize_content: sanitize_content)

    content = sanitized_html.presence || "<p><em>#{default_content}</em></p>"

    if strip_single_p
      self.class.strip_single_p(content)
    else
      rendered_liquid
    end
  end

  private

  def sanitize_html(html, sanitize_content: true)
    if sanitize_content
      sanitize(
        html,
        tags: %w[
          strong b em i a hr table thead tbody tr td th p br img center small h1 h2 h3 h4 h5 h6
          ol ul li sup sub pre code
        ],
        attributes: %w[href src alt]
      )
    else
      sanitize(html, scrubber: Rails::Html::TargetScrubber.new) # target nothing for removal
    end
  end

  def render_liquid(liquid, whitelist_liquid_tags: true)
    template = Liquid::Template.parse(liquid)

    if whitelist_liquid_tags
      template.root.nodelist.select! do |node|
        ALLOWED_LIQUID_NODE_CLASSES.any? { |klass| node.is_a?(klass) }
      end
    end

    if cadmus_renderer
      cadmus_renderer.render(template, :html)
    else
      template.render.html_safe
    end
  rescue StandardError => e
    %(<div class="alert alert-danger">#{e.message}</div>\n#{liquid}).html_safe
  end
end
