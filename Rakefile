# Generating Quicktest HTML pages

# Make sure rake, erb and json are installed by running:
# `gem install rake erb json`

require 'rubygems'
require 'rake'
require 'erb'
require 'json'

namespace :tests do

  desc 'generate all quicktest html files'
  task :generate_all do
    if ask("Generate all html quicktest files. Are you sure you want to do this? y or n", ['y', 'n']) == 'y'
      list = File.join('quicktests', 'list_of_quicktests.json')
      if File.exists?(list)
        quicktests = JSON.parse(File.read(list))

        quicktests.each do |quicktest|
          generate_html_quicktest(quicktest['name'])
        end
      else
        puts "#{list} file does not exist..."
      end
    else
      puts "Aborting..."
    end
  end

  desc 'generate html for quicktest'
  task :generate_html do
    name = ENV['name'] || abort("Must specify a name of quicktest to generate. Rerun: rake tests:generate_html name=add_time")
    generate_html_quicktest(name)
  end

end


def path_to_quicktest(name)
  File.join("quicktests", "js", "#{name}.js")
end

def export_html_for_quicktest(name)
  File.join(File.dirname(__FILE__), "quicktests", "html", "#{name}.html")
end

def generate_html_quicktest(name)
  js_file = "../js/#{name}.js"
  title = name.gsub(/\_/, ' ').split(/(\W)/).map(&:capitalize).join
  html_file = export_html_for_quicktest(name)

  page = QuickTestPage.new(title, get_template, js_file)
  page.save(html_file)
end

# utility methods
def ask(message, valid_options)
  if valid_options
    answer = get_stdin("#{message} #{valid_options.to_s.gsub(/"/, '').gsub(/, /,'/')} ") while !valid_options.include?(answer)
  else
    answer = get_stdin(message)
  end
  answer
end

def get_stdin(message)
  print message
  STDIN.gets.chomp
end

class QuickTestPage
  include ERB::Util
  attr_accessor :title, :template, :js_path

  def initialize(title, template, js_path)
    @title = title
    @template = template
    @js_path = js_path
  end

  def render
    ERB.new(@template).result(binding)
  end

  def save(file)
    File.open(file, "w+") do |f|
      f.write(render)
    end
  end
end

def get_template
%{
<html>
  <head>
    <title><%= title %></title>
    <link rel="stylesheet" type="text/css" href="../../plottable.css">
    <style>
      svg {
        background-color: #EEE;
      }

      div {
        padding: 20px;
      }
    </style>
    <script src="http://d3js.org/d3.v3.js" charset="utf-8"></script>
    <script src="../../plottable.js"></script>
    <script src="../exampleUtil.js"></script>
    <script src="<%= js_path %>"></script>

    <script>
      window.onload = function() {
        var div = d3.select("#testdiv");
        run(div, makeData(), Plottable);
      }
  </script>
  </head>

  <body>
    <div id="testdiv"></div>
  </body>

</html>}
end
