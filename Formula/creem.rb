# typed: false
# frozen_string_literal: true

class Creem < Formula
  desc "Command-line interface for Creem"
  homepage "https://creem.io"
  url "https://github.com/armitage-labs/creem-cli/releases/download/v0.1.1/creem-cli-0.1.1.tgz"
  sha256 "bf59f6d9157c63290c2084c3c2d9abc353b5e338be1fd0dcc8711533af16e8f0"
  license "MIT"

  depends_on "node@22"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/creem --version")
  end
end
