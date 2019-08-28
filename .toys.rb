require 'tmpdir'

tool 'update_schema' do
  desc 'Regenerate the GraphQL schema and documentation'

  include :exec, exit_on_nonzero_status: true
  flag :publish

  def run
    sh 'bin/rake graphql:schema:dump'
    sh 'yarn run graphql:build_fragment_types'

    return unless publish
    Dir.mktmpdir do |dir|
      sh "git clone --depth 1 -b gh-pages $(git remote get-url origin) #{dir}"

      dest_dir = File.expand_path('schema', dir)
      FileUtils.rm_rf(dest_dir) if File.exist?(dest_dir)
      sh "yarn run graphdoc:generate -o #{dest_dir}"

      Dir.chdir(dir) do
        sh "git commit -a -m 'Schema docs update'"
        sh 'git push'
      end
    end
  end
end

tool 'pull_production_db' do
  desc 'Pull down the production database into development'
  include :exec, exit_on_nonzero_status: true

  def run
    sh 'bin/pull_production_database'
  end
end

tool 'load_production_db' do
  desc 'Load a production pgdump into development'
  include :exec, exit_on_nonzero_status: true
  flag :file, default: 'intercode_production.pgdump'

  def run
    sh "docker-compose -f docker-compose.yml -f docker-compose.load_production_database.yml \
run load_production_database bin/load_production_database #{file}"
  end
end

tool 'cleanup_branches' do
  desc 'Clean up local branches that were deleted or merged in origin'
  include :exec, exit_on_nonzero_status: true

  def run
    sh 'git fetch origin --prune'
    sh 'git branch --merged | egrep -v "(^\*|master)" | xargs git branch -d'
  end
end

tool 'update_liquid_doc_json' do
  desc 'Generate a new liquid_doc.json by introspecting the Liquid code'

  def serialize_class(klass)
    {
      name: klass.path,
      superclasses: klass.inheritance_tree.map(&:path),
      docstring: klass.docstring,
      tags: klass.tags.map { |tag| serialize_tag(tag) },
      methods: klass.meths.map { |meth| serialize_method(meth) }
    }
  end

  def serialize_method(meth)
    {
      name: meth.name,
      docstring: meth.docstring,
      tags: meth.tags.map { |tag| serialize_tag(tag) }
    }
  end

  def serialize_tag(tag)
    {
      tag_name: tag.tag_name,
      name: tag.name,
      text: tag.text,
      types: tag.types
    }
  end

  def serialize_registry
    classes = YARD::Registry.all.select { |obj| obj.is_a?(YARD::CodeObjects::ClassObject) }
    filters_module = YARD::Registry.all.find do |obj|
      obj.is_a?(YARD::CodeObjects::ModuleObject) && obj.path == 'Intercode::Liquid::Filters'
    end

    {
      classes: classes.map { |klass| serialize_class(klass) },
      filter_methods: filters_module.meths.map { |meth| serialize_method(meth) }
    }
  end

  def run
    require 'yard'
    require 'json'
    require 'pry'

    YARD::Tags::Library.define_tag('Liquid tag name', :liquid_tag_name)

    %w[
      app/liquid_drops/**/*.rb
      lib/intercode/liquid/**/*.rb
      app/models/cms_variable.rb
    ].each do |path|
      YARD.parse(path)
    end

    File.open('liquid_doc.json', 'w') do |file|
      file.write(JSON.pretty_generate(serialize_registry))
    end
  end
end