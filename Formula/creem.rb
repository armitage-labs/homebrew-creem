# typed: false
# frozen_string_literal: true

class Creem < Formula
  desc "CLI for Creem - the Stripe alternative for SaaS"
  homepage "https://creem.io"
  url "https://registry.npmjs.org/creem-cli/-/creem-cli-0.1.0.tgz"
  sha256 "PLACEHOLDER_UPDATE_AFTER_NPM_PUBLISH"
  license "MIT"

  depends_on "node@18"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/creem --version")
  end
end
